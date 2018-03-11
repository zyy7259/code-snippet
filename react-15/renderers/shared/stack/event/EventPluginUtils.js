import ReactDOMComponentTree from 'root/renderers/dom/client/ReactDOMComponentTree';
import ReactDOMTreeTraversal from 'root/renderers/dom/client/ReactDOMTreeTraversal';
import ReactErrorUtils from 'root/renderers/shared/util/ReactErrorUtils';

/**
 * Dispatch the event to the listener.
 * @param {SyntheticEvent} event SyntheticEvent to handle
 * @param {boolean} simulated If the event is simulated (changes exn behavior)
 * @param {function} listener Application-level callback
 * @param {*} inst Internal component instance
 */
function executeDispatch(event, simulated, listener, inst) {
  var type = event.type || 'unknown-event';
  event.currentTarget = ReactDOMComponentTree.getNodeFromInstance(inst);
  if (simulated) {
    ReactErrorUtils.invokeGuardedCallbackWithCatch(type, listener, event);
  } else {
    ReactErrorUtils.invokeGuardedCallback(type, listener, event);
  }
  event.currentTarget = null;
}

/**
 * Standard/simple iteration through an event's collected dispatches, but stops
 * at the first dispatch execution returning true, and returns that id.
 *
 * @return {?string} id of the first dispatch execution who's listener returns
 * true, or null if no listener returned true.
 */
function executeDispatchesInOrderStopAtTrueImpl(event) {
  var dispatchListeners = event._dispatchListeners;
  var dispatchInstances = event._dispatchInstances;
  if (Array.isArray(dispatchListeners)) {
    for (var i = 0; i < dispatchListeners.length; i++) {
      if (event.isPropagationStopped()) {
        break;
      }
      // Listeners and Instances are two parallel arrays that are always in sync.
      if (dispatchListeners[i](event, dispatchInstances[i])) {
        return dispatchInstances[i];
      }
    }
  } else if (dispatchListeners) {
    if (dispatchListeners(event, dispatchInstances)) {
      return dispatchInstances;
    }
  }
  return null;
}

var EventPluginUtils = {
  isEndish(topLevelType) {
    return (
      topLevelType === 'topMouseUp' ||
      topLevelType === 'topTouchEnd' ||
      topLevelType === 'topTouchCancel'
    );
  },

  isMoveish(topLevelType) {
    return topLevelType === 'topMouseMove' || topLevelType === 'topTouchMove';
  },
  isStartish(topLevelType) {
    return topLevelType === 'topMouseDown' || topLevelType === 'topTouchStart';
  },

  /**
   * @param {SyntheticEvent} event
   * @return {boolean} True iff number of dispatches accumulated is greater than 0.
   */
  hasDispatches(event) {
    return !!event._dispatchListeners;
  },

  /**
   * Execution of a "direct" dispatch - there must be at most one dispatch
   * accumulated on the event or it is considered an error. It doesn't really make
   * sense for an event with multiple dispatches (bubbled) to keep track of the
   * return values at each dispatch execution, but it does tend to make sense when
   * dealing with "direct" dispatches.
   *
   * @return {*} The return value of executing the single dispatch.
   */
  executeDirectDispatch(event) {
    var dispatchListener = event._dispatchListeners;
    var dispatchInstance = event._dispatchInstances;
    event.currentTarget = dispatchListener
      ? ReactDOMComponentTree.getNodeFromInstance(dispatchInstance)
      : null;
    var res = dispatchListener ? dispatchListener(event) : null;
    event.currentTarget = null;
    event._dispatchListeners = null;
    event._dispatchInstances = null;
    return res;
  },

  /**
   * Standard/simple iteration through an event's collected dispatches.
   */
  executeDispatchesInOrder(event, simulated) {
    var dispatchListeners = event._dispatchListeners;
    var dispatchInstances = event._dispatchInstances;
    if (Array.isArray(dispatchListeners)) {
      for (var i = 0; i < dispatchListeners.length; i++) {
        if (event.isPropagationStopped()) {
          break;
        }
        // Listeners and Instances are two parallel arrays that are always in sync.
        executeDispatch(
          event,
          simulated,
          dispatchListeners[i],
          dispatchInstances[i]
        );
      }
    } else if (dispatchListeners) {
      executeDispatch(event, simulated, dispatchListeners, dispatchInstances);
    }
    event._dispatchListeners = null;
    event._dispatchInstances = null;
  },

  /**
   * @see executeDispatchesInOrderStopAtTrueImpl
   */
  executeDispatchesInOrderStopAtTrue(event) {
    var ret = executeDispatchesInOrderStopAtTrueImpl(event);
    event._dispatchInstances = null;
    event._dispatchListeners = null;
    return ret;
  },

  ...ReactDOMTreeTraversal
};

export default EventPluginUtils;
