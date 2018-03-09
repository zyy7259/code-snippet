import * as ReactBaseClasses from './ReactBaseClasses';
import ReactElement from './ReactElement';

var React = {
  Component: ReactBaseClasses.ReactComponent,
  PureComponent: ReactBaseClasses.ReactPureComponent,
  isValidElement: ReactElement.isValidElement,
  createElement: ReactElement.createElement
};

// @singleton
export default React;
