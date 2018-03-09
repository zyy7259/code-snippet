import ReactUpdateQueue from './ReactUpdateQueue';

export class ReactComponent {
  constructor(props, context, updater) {
    this.props = props;
    this.context = context;
    this.refs = emptyObject;
    // We initialize the default updater but the real one gets injected by the
    // renderer.
    this.updater = ReactUpdateQueue;
  }
}

ReactComponent.prototype.isReactComponent = {};

ReactComponent.prototype.setState = function(partialState, callback) {
  this.updater.enqueueSetState(this, partialState);
  if (callback) {
    this.updater.enqueueCallback(this, callback, 'setState');
  }
};

ReactComponent.prototype.forceUpdate = function(callback) {
  this.updater.enqueueForceUpdate(this);
  if (callback) {
    this.updater.enqueueCallback(this, callback, 'forceUpdate');
  }
};

export class ReactPureComponent extends ReactComponent {}
ReactPureComponent.prototype.isPureReactComponent = true;
