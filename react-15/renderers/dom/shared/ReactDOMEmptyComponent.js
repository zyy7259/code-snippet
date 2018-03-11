import DOMLazyTree from 'root/renderers/dom/client/util/DOMLazyTree';
import ReactDOMComponentTree from 'root/renderers/dom/client/ReactDOMComponentTree';

var ReactDOMEmptyComponent = function(instantiate) {
  // ReactCompositeComponent uses this:
  this._currentElement = null;
  // ReactDOMComponentTree uses these:
  this._hostNode = null;
  this._hostParent = null;
  this._hostContainerInfo = null;
  this._domID = 0;
};
Object.assign(ReactDOMEmptyComponent.prototype, {
  mountComponent: function(
    transaction,
    hostParent,
    hostContainerInfo,
    context
  ) {
    var domID = hostContainerInfo._idCounter++;
    this._domID = domID;
    this._hostParent = hostParent;
    this._hostContainerInfo = hostContainerInfo;

    var nodeValue = ' react-empty: ' + this._domID + ' ';
    if (transaction.useCreateElement) {
      var ownerDocument = hostContainerInfo._ownerDocument;
      var node = ownerDocument.createComment(nodeValue);
      ReactDOMComponentTree.precacheNode(this, node);
      return DOMLazyTree(node);
    } else {
      if (transaction.renderToStaticMarkup) {
        // Normally we'd insert a comment node, but since this is a situation
        // where React won't take over (static pages), we can simply return
        // nothing.
        return '';
      }
      return '<!--' + nodeValue + '-->';
    }
  },
  receiveComponent: function() {},
  getHostNode: function() {
    return ReactDOMComponentTree.getNodeFromInstance(this);
  },
  unmountComponent: function() {
    ReactDOMComponentTree.uncacheNode(this);
  }
});

export default ReactDOMEmptyComponent;
