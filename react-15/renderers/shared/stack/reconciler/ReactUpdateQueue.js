import ReactInstanceMap from 'root/renderers/shared/shared/ReactInstanceMap';
import ReactUpdates from './ReactUpdates';

function getInternalInstanceReadyForUpdate(publicInstance, callerName) {
  return ReactInstanceMap.get(publicInstance);
}

function enqueueUpdate(internalInstance) {
  ReactUpdates.enqueueUpdate(internalInstance);
}

/**
 * ReactUpdateQueue allows for state updates to be scheduled into a later
 * reconciliation step.
 */
var ReactUpdateQueue = {
  enqueueCallback: function(publicInstance, callback, callerName) {
    ReactUpdateQueue.validateCallback(callback, callerName);
    var internalInstance = getInternalInstanceReadyForUpdate(publicInstance);

    if (internalInstance._pendingCallbacks) {
      internalInstance._pendingCallbacks.push(callback);
    } else {
      internalInstance._pendingCallbacks = [callback];
    }
    enqueueUpdate(internalInstance);
  },

  // FIXME:
  enqueueCallbackInternal() {},

  // FIXME:
  enqueueForceUpdate() {},

  // FIXME:
  enqueueReplaceState() {},

  enqueueSetState() {
    var internalInstance = getInternalInstanceReadyForUpdate(
      publicInstance,
      'setState'
    );

    var queue =
      internalInstance._pendingStateQueue ||
      (internalInstance._pendingStateQueue = []);
    queue.push(partialState);

    enqueueUpdate(internalInstance);
  },

  // FIXME:
  enqueueElementInternal() {},

  validateCallback(callback, callerName) {
    invariant(
      !callback || typeof callback === 'function',
      '%s(...): Expected the last optional `callback` argument to be a ' +
        'function. Instead received: %s.',
      callerName
    );
  }
};

// @singleton
export default ReactUpdateQueue;
