import ReactDOMComponentTree from 'root/renderers/dom/client/ReactDOMComponentTree';
import focusNode from 'root/shared/util/focusNode';

var AutoFocusUtils = {
  focusDOMComponent: function() {
    focusNode(ReactDOMComponentTree.getNodeFromInstance(this));
  }
};

export default AutoFocusUtils;
