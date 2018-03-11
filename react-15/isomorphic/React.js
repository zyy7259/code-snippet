import * as ReactBaseClasses from './ReactBaseClasses';
import ReactElement from './ReactElement';
import ReactChildren from './ReactChildren';

var React = {
  // Modern

  Children: {
    map: ReactChildren.map,
    forEach: ReactChildren.forEach,
    count: ReactChildren.count,
    toArray: ReactChildren.toArray,
    only: onlyChild
  },

  Component: ReactBaseClasses.ReactComponent,
  PureComponent: ReactBaseClasses.ReactPureComponent,
  isValidElement: ReactElement.isValidElement,
  createElement: ReactElement.createElement
};

// @singleton
export default React;
