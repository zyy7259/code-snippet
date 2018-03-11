import ReactComponentBrowserEnvironment from 'root/renderers/dom/shared/ReactComponentBrowserEnvironment';
import flattenChildren from 'root/shared/util/flattenChildren';
import ReactChildReconciler from './ReactChildReconciler';
import ReactReconciler from './ReactReconciler';

/**
 * Make an update for setting the text content.
 *
 * @param {string} textContent Text content to set.
 * @private
 */
function makeTextContent(textContent) {
  // NOTE: Null values reduce hidden classes.
  return {
    type: 'TEXT_CONTENT',
    content: textContent,
    fromIndex: null,
    fromNode: null,
    toIndex: null,
    afterNode: null
  };
}

/**
 * Make an update for setting the markup of a node.
 *
 * @param {string} markup Markup that renders into an element.
 * @private
 */
function makeSetMarkup(markup) {
  // NOTE: Null values reduce hidden classes.
  return {
    type: 'SET_MARKUP',
    content: markup,
    fromIndex: null,
    fromNode: null,
    toIndex: null,
    afterNode: null
  };
}

/**
 * Make an update for moving an existing element to another index.
 *
 * @param {number} fromIndex Source index of the existing element.
 * @param {number} toIndex Destination index of the element.
 * @private
 */
function makeMove(child, afterNode, toIndex) {
  // NOTE: Null values reduce hidden classes.
  return {
    type: 'MOVE_EXISTING',
    content: null,
    fromIndex: child._mountIndex,
    fromNode: ReactReconciler.getHostNode(child),
    toIndex: toIndex,
    afterNode: afterNode
  };
}

/**
 * Make an update for markup to be rendered and inserted at a supplied index.
 *
 * @param {string} markup Markup that renders into an element.
 * @param {number} toIndex Destination index.
 * @private
 */
function makeInsertMarkup(markup, afterNode, toIndex) {
  // NOTE: Null values reduce hidden classes.
  return {
    type: 'INSERT_MARKUP',
    content: markup,
    fromIndex: null,
    fromNode: null,
    toIndex: toIndex,
    afterNode: afterNode
  };
}

/**
 * Make an update for removing an element at an index.
 *
 * @param {number} fromIndex Index of the element to remove.
 * @private
 */
function makeRemove(child, node) {
  // NOTE: Null values reduce hidden classes.
  return {
    type: 'REMOVE_NODE',
    content: null,
    fromIndex: child._mountIndex,
    fromNode: node,
    toIndex: null,
    afterNode: null
  };
}

/**
 * Push an update, if any, onto the queue. Creates a new queue if none is
 * passed and always returns the queue. Mutative.
 */
function enqueue(queue, update) {
  if (update) {
    queue = queue || [];
    queue.push(update);
  }
  return queue;
}

/**
 * Processes any enqueued updates.
 *
 * @private
 */
function processQueue(inst, updateQueue) {
  ReactComponentBrowserEnvironment.processChildrenUpdates(inst, updateQueue);
}

/**
 * ReactMultiChild are capable of reconciling multiple children.
 *
 * Provides common functionality for components that must reconcile multiple
 * children. This is used by `ReactDOMComponent` to mount, update, and
 * unmount child components.
 *
 * @class ReactMultiChild
 * @internal
 */
class ReactMultiChild {
  /**
   * Generates a "mount image" for each of the supplied children. In the case
   * of `ReactDOMComponent`, a mount image is a string of markup.
   *
   * @param {?object} nestedChildren Nested child maps.
   * @return {array} An array of mounted representations.
   * @internal
   */
  mountChildren(nestedChildren, transaction, context) {
    var children = this._reconcilerInstantiateChildren(
      nestedChildren,
      transaction,
      context
    );
    this._renderedChildren = children;

    var mountImages = [];
    var index = 0;
    for (var name in children) {
      if (children.hasOwnProperty(name)) {
        var child = children[name];
        var selfDebugID = 0;
        var mountImage = ReactReconciler.mountComponent(
          child,
          transaction,
          this,
          this._hostContainerInfo,
          context,
          selfDebugID
        );
        child._mountIndex = index++;
        mountImages.push(mountImage);
      }
    }

    return mountImages;
  }

  _reconcilerInstantiateChildren(nestedChildren, transaction, context) {
    return ReactChildReconciler.instantiateChildren(
      nestedChildren,
      transaction,
      context
    );
  }

  /**
   * Unmounts all rendered children. This should be used to clean up children
   * when this component is unmounted. It does not actually perform any
   * backend operations.
   *
   * @internal
   */
  unmountChildren(safely) {
    var renderedChildren = this._renderedChildren;
    ReactChildReconciler.unmountChildren(renderedChildren, safely);
    this._renderedChildren = null;
  }

  /**
   * Replaces any rendered children with a text content string.
   *
   * @param {string} nextContent String of content.
   * @internal
   */
  updateTextContent(nextContent) {
    var prevChildren = this._renderedChildren;
    // Remove any rendered children.
    ReactChildReconciler.unmountChildren(prevChildren, false);
    for (var name in prevChildren) {
      if (prevChildren.hasOwnProperty(name)) {
        invariant(false, 'updateTextContent called on non-empty component.');
      }
    }
    // Set new text content.
    var updates = [makeTextContent(nextContent)];
    processQueue(this, updates);
  }

  /**
   * Replaces any rendered children with a markup string.
   *
   * @param {string} nextMarkup String of markup.
   * @internal
   */
  updateMarkup(nextMarkup) {
    var prevChildren = this._renderedChildren;
    // Remove any rendered children.
    ReactChildReconciler.unmountChildren(prevChildren, false);
    for (var name in prevChildren) {
      if (prevChildren.hasOwnProperty(name)) {
        invariant(false, 'updateTextContent called on non-empty component.');
      }
    }
    var updates = [makeSetMarkup(nextMarkup)];
    processQueue(this, updates);
  }

  /**
   * Updates the rendered children with new children.
   *
   * @param {?object} nextNestedChildrenElements Nested child element maps.
   * @param {ReactReconcileTransaction} transaction
   * @internal
   */
  updateChildren(nextNestedChildrenElements, transaction, context) {
    // Hook used by React ART
    this._updateChildren(nextNestedChildrenElements, transaction, context);
  }

  /**
   * @param {?object} nextNestedChildrenElements Nested child element maps.
   * @param {ReactReconcileTransaction} transaction
   * @final
   * @protected
   */
  _updateChildren(nextNestedChildrenElements, transaction, context) {
    var prevChildren = this._renderedChildren;
    // nodes to be removed, name -> node
    var removedNodes = {};
    // markups to be added
    var mountImages = [];
    // next children, name -> children
    var nextChildren = this._reconcilerUpdateChildren(
      prevChildren,
      nextNestedChildrenElements,
      mountImages,
      removedNodes,
      transaction,
      context
    );
    if (!nextChildren && !prevChildren) {
      return;
    }
    var updates = null;
    var name;
    // `nextIndex` will increment for each child in `nextChildren`, but
    // `lastIndex` will be the last index visited in `prevChildren`.
    var nextIndex = 0;
    var lastIndex = 0;
    // `nextMountIndex` will increment for each newly mounted child.
    var nextMountIndex = 0;
    var lastPlacedNode = null;
    // for example
    // prevChild: a b c d e
    // nextChild: a d f b e g
    // a b c d e        a (skip move)
    // a b c d e        d (skip move)
    // a b c d f e      f (add after d)
    // a c d f b e      b (move after f)
    // a c d f b e      e (skip move)
    // a c d f b e g    g (add, after e)
    // a d f b e g      c (remove)
    for (name in nextChildren) {
      if (!nextChildren.hasOwnProperty(name)) {
        continue;
      }
      var prevChild = prevChildren && prevChildren[name];
      var nextChild = nextChildren[name];
      if (prevChild === nextChild) {
        updates = enqueue(
          updates,
          this.moveChild(prevChild, lastPlacedNode, nextIndex, lastIndex)
        );
        lastIndex = Math.max(prevChild._mountIndex, lastIndex);
        prevChild._mountIndex = nextIndex;
      } else {
        if (prevChild) {
          // Update `lastIndex` before `_mountIndex` gets unset by unmounting.
          lastIndex = Math.max(prevChild._mountIndex, lastIndex);
          // The `removedNodes` loop below will actually remove the child.
        }
        // The child must be instantiated before it's mounted.
        updates = enqueue(
          updates,
          this._mountChildAtIndex(
            nextChild,
            mountImages[nextMountIndex],
            lastPlacedNode,
            nextIndex,
            transaction,
            context
          )
        );
        nextMountIndex++;
      }
      nextIndex++;
      lastPlacedNode = ReactReconciler.getHostNode(nextChild);
    }
    // Remove children that are no longer present.
    for (name in removedNodes) {
      if (removedNodes.hasOwnProperty(name)) {
        updates = enqueue(
          updates,
          this._unmountChild(prevChildren[name], removedNodes[name])
        );
      }
    }
    if (updates) {
      processQueue(this, updates);
    }
    this._renderedChildren = nextChildren;
  }

  _reconcilerUpdateChildren(
    prevChildren,
    nextNestedChildrenElements,
    mountImages,
    removedNodes,
    transaction,
    context
  ) {
    var nextChildren;
    var selfDebugID = 0;
    // convert nextNestedChildrenElements [array] to nextChildren [map: name -> child]
    nextChildren = flattenChildren(nextNestedChildrenElements, selfDebugID);
    ReactChildReconciler.updateChildren(
      prevChildren,
      nextChildren,
      mountImages,
      removedNodes,
      transaction,
      this,
      this._hostContainerInfo,
      context,
      selfDebugID
    );
    return nextChildren;
  }

  /**
   * Moves a child component to the supplied index.
   *
   * @param {ReactComponent} child Component to move.
   * @param {number} toIndex Destination index of the element.
   * @param {number} lastIndex Last index visited of the siblings of `child`.
   * @protected
   */
  moveChild(child, afterNode, toIndex, lastIndex) {
    // If the index of `child` is less than `lastIndex`, then it needs to
    // be moved. Otherwise, we do not need to move it because a child will be
    // inserted or moved before `child`.
    if (child._mountIndex < lastIndex) {
      return makeMove(child, afterNode, toIndex);
    }
  }

  /**
   * Mounts a child with the supplied name.
   *
   * NOTE: This is part of `updateChildren` and is here for readability.
   *
   * @param {ReactComponent} child Component to mount.
   * @param {string} name Name of the child.
   * @param {number} index Index at which to insert the child.
   * @param {ReactReconcileTransaction} transaction
   * @private
   */
  _mountChildAtIndex(
    child,
    mountImage,
    afterNode,
    index,
    transaction,
    context
  ) {
    child._mountIndex = index;
    return this.createChild(child, afterNode, mountImage);
  }

  /**
   * Creates a child component.
   *
   * @param {ReactComponent} child Component to create.
   * @param {string} mountImage Markup to insert.
   * @protected
   */
  createChild(child, afterNode, mountImage) {
    return makeInsertMarkup(mountImage, afterNode, child._mountIndex);
  }

  /**
   * Unmounts a rendered child.
   *
   * NOTE: This is part of `updateChildren` and is here for readability.
   *
   * @param {ReactComponent} child Component to unmount.
   * @private
   */
  _unmountChild(child, node) {
    var update = this.removeChild(child, node);
    child._mountIndex = null;
    return update;
  }

  /**
   * Removes a child component.
   *
   * @param {ReactComponent} child Child to remove.
   * @protected
   */
  removeChild(child, node) {
    return makeRemove(child, node);
  }
}

export default ReactMultiChild;
