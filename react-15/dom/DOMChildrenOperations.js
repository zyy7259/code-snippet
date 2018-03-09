import Danger from './Danger';

/**
 * Operations for updating with DOM children.
 */
var ReactDOMIDOperations = {
  dangerouslyReplaceNodeWithMarkup: Danger.dangerouslyReplaceNodeWithMarkup,

  replaceDelimitedText() {
    // TODO:
  },

  /**
   * Updates a component's children by processing a series of updates. The
   * update configurations are each expected to have a `parentNode` property.
   *
   * @param {array<object>} updates List of update configurations.
   * @internal
   */
  processUpdates(parentNode, updates) {
    // TODO:
  }
};

export default ReactDOMIDOperations;
