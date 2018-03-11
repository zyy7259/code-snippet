import DOMLazyTree from './DOMLazyTree';
import Danger from 'root/renderers/dom/shared/Danger';
import ReactDOMComponentTree from 'root/renderers/dom/client/ReactDOMComponentTree';
import createMicrosoftUnsafeLocalFunction from './createMicrosoftUnsafeLocalFunction';
import setInnerHTML from './setInnerHTML';
import setTextContent from './setTextContent';

function getNodeAfter(parentNode, node) {
  // Special case for text components, which return [open, close] comments
  // from getHostNode.
  if (Array.isArray(node)) {
    node = node[1];
  }
  return node ? node.nextSibling : parentNode.firstChild;
}

/**
 * Inserts `childNode` as a child of `parentNode` at the `index`.
 *
 * @param {DOMElement} parentNode Parent node in which to insert.
 * @param {DOMElement} childNode Child node to insert.
 * @param {number} index Index at which to insert the child.
 * @internal
 */
var insertChildAt = createMicrosoftUnsafeLocalFunction(function(
  parentNode,
  childNode,
  referenceNode
) {
  // We rely exclusively on `insertBefore(node, null)` instead of also using
  // `appendChild(node)`. (Using `undefined` is not allowed by all browsers so
  // we are careful to use `null`.)
  parentNode.insertBefore(childNode, referenceNode);
});

function moveDelimitedText(
  parentNode,
  openingComment,
  closingComment,
  referenceNode
) {
  var node = openingComment;
  while (true) {
    var nextNode = node.nextSibling;
    insertChildAt(parentNode, node, referenceNode);
    if (node === closingComment) {
      break;
    }
    node = nextNode;
  }
}

function removeDelimitedText(parentNode, startNode, closingComment) {
  while (true) {
    var node = startNode.nextSibling;
    if (node === closingComment) {
      // The closing comment is removed by ReactMultiChild.
      break;
    } else {
      parentNode.removeChild(node);
    }
  }
}

function moveChild(parentNode, childNode, referenceNode) {
  if (Array.isArray(childNode)) {
    moveDelimitedText(parentNode, childNode[0], childNode[1], referenceNode);
  } else {
    insertChildAt(parentNode, childNode, referenceNode);
  }
}

function insertLazyTreeChildAt(parentNode, childTree, referenceNode) {
  DOMLazyTree.insertTreeBefore(parentNode, childTree, referenceNode);
}

function removeChild(parentNode, childNode) {
  if (Array.isArray(childNode)) {
    var closingComment = childNode[1];
    childNode = childNode[0];
    removeDelimitedText(parentNode, childNode, closingComment);
    parentNode.removeChild(closingComment);
  }
  parentNode.removeChild(childNode);
}

/**
 * Operations for updating with DOM children.
 */
var DOMChildrenOperations = {
  dangerouslyReplaceNodeWithMarkup: Danger.dangerouslyReplaceNodeWithMarkup,

  replaceDelimitedText(openingComment, closingComment, stringText) {
    var parentNode = openingComment.parentNode;
    var nodeAfterComment = openingComment.nextSibling;
    if (nodeAfterComment === closingComment) {
      // There are no text nodes between the opening and closing comments; insert
      // a new one if stringText isn't empty.
      if (stringText) {
        insertChildAt(
          parentNode,
          document.createTextNode(stringText),
          nodeAfterComment
        );
      }
    } else {
      if (stringText) {
        // Set the text content of the first node after the opening comment, and
        // remove all following nodes up until the closing comment.
        setTextContent(nodeAfterComment, stringText);
        removeDelimitedText(parentNode, nodeAfterComment, closingComment);
      } else {
        removeDelimitedText(parentNode, openingComment, closingComment);
      }
    }
  },

  /**
   * Updates a component's children by processing a series of updates. The
   * update configurations are each expected to have a `parentNode` property.
   *
   * @param {array<object>} updates List of update configurations.
   * @internal
   */
  processUpdates(parentNode, updates) {
    for (var k = 0; k < updates.length; k++) {
      var update = updates[k];
      switch (update.type) {
        case 'TEXT_CONTENT':
          setTextContent(parentNode, update.content);
          break;
        case 'SET_MARKUP':
          setInnerHTML(parentNode, update.content);
          break;
        case 'MOVE_EXISTING':
          moveChild(
            parentNode,
            update.fromNode,
            getNodeAfter(parentNode, update.afterNode)
          );
          break;
        case 'INSERT_MARKUP':
          insertLazyTreeChildAt(
            parentNode,
            update.content,
            getNodeAfter(parentNode, update.afterNode)
          );
          break;
        case 'REMOVE_NODE':
          removeChild(parentNode, update.fromNode);
          break;
      }
    }
  }
};

export default DOMChildrenOperations;
