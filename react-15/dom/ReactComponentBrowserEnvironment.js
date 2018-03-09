import DOMChildrenOperations from './DOMChildrenOperations';
import ReactDOMIDOperations from './ReactDOMIDOperations';

/**
 * Abstracts away all functionality of the reconciler that requires knowledge of
 * the browser context. TODO: These callers should be refactored to avoid the
 * need for this injection.
 */
var ReactComponentBrowserEnvironment = {
  processChildrenUpdates:
    ReactDOMIDOperations.dangerouslyProcessChildrenUpdates,

  replaceNodeWithMarkup: DOMChildrenOperations.dangerouslyReplaceNodeWithMarkup
};

export default ReactComponentBrowserEnvironment;
