import ReactDOMComponentTree from 'root/renderers/dom/client/ReactDOMComponentTree';
import DOMChildrenOperations from 'root/renderers/dom/client/util/DOMChildrenOperations';

/**
 * Operations used to process updates to DOM nodes.
 */
var ReactDOMIDOperations = {
  /**
   * Updates a component's children by processing a series of updates.
   *
   * @param {array<object>} updates List of update configurations.
   * @internal
   */
  dangerouslyProcessChildrenUpdates(parentInst, updates) {
    var node = ReactDOMComponentTree.getNodeFromInstance(parentInst);
    DOMChildrenOperations.processUpdates(node, updates);
  }
};

export default ReactDOMIDOperations;
