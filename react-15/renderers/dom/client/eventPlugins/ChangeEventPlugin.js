import EventPluginHub from 'renderers/shared/stack/event/EventPluginHub';
import EventPropagators from 'root/renderers/shared/stack/event/EventPropagators';
import ExecutionEnvironment from 'root/shared/util/ExecutionEnvironment';
import ReactDOMComponentTree from 'root/renderers/dom/client/ReactDOMComponentTree';
import ReactUpdates from 'root/renderers/shared/stack/reconciler/ReactUpdates';
import SyntheticEvent from 'root/renderers/shared/stack/event/SyntheticEvent';
import inputValueTracking from 'root/renderers/dom/client/inputValueTracking';
import getEventTarget from 'root/renderers/dom/client/util/getEventTarget';
import isEventSupported from 'root/renderers/dom/client/util/isEventSupported';
import isTextInputElement from 'root/renderers/shared/util/isTextInputElement';

var eventTypes = {
  change: {
    phasedRegistrationNames: {
      bubbled: 'onChange',
      captured: 'onChangeCapture'
    },
    dependencies: [
      'topBlur',
      'topChange',
      'topClick',
      'topFocus',
      'topInput',
      'topKeyDown',
      'topKeyUp',
      'topSelectionChange'
    ]
  }
};

function createAndAccumulateChangeEvent(inst, nativeEvent, target) {
  var event = SyntheticEvent.getPooled(
    eventTypes.change,
    inst,
    nativeEvent,
    target
  );
  event.type = 'change';
  EventPropagators.accumulateTwoPhaseDispatches(event);
  return event;
}

function getInstIfValueChanged(targetInst, nativeEvent) {
  var updated = inputValueTracking.updateValueIfChanged(targetInst);
  var simulated =
    nativeEvent.simulated === true &&
    ChangeEventPlugin._allowSimulatedPassThrough;

  if (updated || simulated) {
    return targetInst;
  }
}

/**
 * For IE shims
 */
var activeElement = null;
var activeElementInst = null;

function manualDispatchChangeEvent(nativeEvent) {
  var event = createAndAccumulateChangeEvent(
    activeElementInst,
    nativeEvent,
    getEventTarget(nativeEvent)
  );

  // If change and propertychange bubbled, we'd just bind to it like all the
  // other events and have it go through ReactBrowserEventEmitter. Since it
  // doesn't, we manually listen for the events and so we have to enqueue and
  // process the abstract event manually.
  //
  // Batching is necessary here in order to ensure that all event handlers run
  // before the next rerender (including event handlers attached to ancestor
  // elements instead of directly on the input). Without this, controlled
  // components don't work properly in conjunction with event bubbling because
  // the component is rerendered and the value reverted before all the event
  // handlers can run. See https://github.com/facebook/react/issues/708.
  ReactUpdates.batchedUpdates(runEventInBatch, event);
}

function runEventInBatch(event) {
  EventPluginHub.enqueueEvents(event);
  EventPluginHub.processEventQueue(false);
}

/**
 * SECTION: handle `change` event
 */
function shouldUseChangeEvent(elem) {
  var nodeName = elem.nodeName && elem.nodeName.toLowerCase();
  return (
    nodeName === 'select' || (nodeName === 'input' && elem.type === 'file')
  );
}

var doesChangeEventBubble = false;
if (ExecutionEnvironment.canUseDOM) {
  // See `handleChange` comment below
  doesChangeEventBubble =
    isEventSupported('change') &&
    (!document.documentMode || document.documentMode > 8);
}

// if doesChangeEventBubble
function getTargetInstForChangeEvent(topLevelType, targetInst) {
  if (topLevelType === 'topChange') {
    return targetInst;
  }
}

// if not doesChangeEventBubble
function handleEventsForChangeEventIE8(topLevelType, target, targetInst) {
  if (topLevelType === 'topFocus') {
    // stopWatching() should be a noop here but we call it just in case we
    // missed a blur event somehow.
    stopWatchingForChangeEventIE8();
    startWatchingForChangeEventIE8(target, targetInst);
  } else if (topLevelType === 'topBlur') {
    stopWatchingForChangeEventIE8();
  }
}

function startWatchingForChangeEventIE8(target, targetInst) {
  activeElement = target;
  activeElementInst = targetInst;
  activeElement.attachEvent('onchange', manualDispatchChangeEvent);
}

function stopWatchingForChangeEventIE8() {
  if (!activeElement) {
    return;
  }
  activeElement.detachEvent('onchange', manualDispatchChangeEvent);
  activeElement = null;
  activeElementInst = null;
}

/**
 * SECTION: handle `input` event
 */
var isInputEventSupported = false;
if (ExecutionEnvironment.canUseDOM) {
  // IE9 claims to support the input event but fails to trigger it when
  // deleting text, so we ignore its input events.

  isInputEventSupported =
    isEventSupported('input') &&
    (!document.documentMode || document.documentMode > 9);
}

// if isInputEventSupported
function getTargetInstForInputOrChangeEvent(
  topLevelType,
  targetInst,
  nativeEvent
) {
  if (topLevelType === 'topInput' || topLevelType === 'topChange') {
    return getInstIfValueChanged(targetInst, nativeEvent);
  }
}

// if not isInputEventSupported
// For IE8 and IE9.
function getTargetInstForInputEventPolyfill(
  topLevelType,
  targetInst,
  nativeEvent
) {
  if (
    topLevelType === 'topSelectionChange' ||
    topLevelType === 'topKeyUp' ||
    topLevelType === 'topKeyDown'
  ) {
    // On the selectionchange event, the target is just document which isn't
    // helpful for us so just check activeElement instead.
    //
    // 99% of the time, keydown and keyup aren't necessary. IE8 fails to fire
    // propertychange on the first input event after setting `value` from a
    // script and fires only keydown, keypress, keyup. Catching keyup usually
    // gets it and catching keydown lets us fire an event for the first
    // keystroke if user does a key repeat (it'll be a little delayed: right
    // before the second keystroke). Other input methods (e.g., paste) seem to
    // fire selectionchange normally.
    return getInstIfValueChanged(activeElementInst, nativeEvent);
  }
}

// if not isInputEventSupported
function handleEventsForInputEventPolyfill(topLevelType, target, targetInst) {
  if (topLevelType === 'topFocus') {
    // In IE8, we can capture almost all .value changes by adding a
    // propertychange handler and looking for events with propertyName
    // equal to 'value'
    // In IE9, propertychange fires for most input events but is buggy and
    // doesn't fire when text is deleted, but conveniently, selectionchange
    // appears to fire in all of the remaining cases so we catch those and
    // forward the event if the value has changed
    // In either case, we don't want to call the event handler if the value
    // is changed from JS so we redefine a setter for `.value` that updates
    // our activeElementValue variable, allowing us to ignore those changes
    //
    // stopWatching() should be a noop here but we call it just in case we
    // missed a blur event somehow.
    stopWatchingForValueChange();
    startWatchingForValueChange(target, targetInst);
  } else if (topLevelType === 'topBlur') {
    stopWatchingForValueChange();
  }
}

/**
 * (For IE <=9) Starts tracking propertychange events on the passed-in element
 * and override the value property so that we can distinguish user events from
 * value changes in JS.
 */
function startWatchingForValueChange(target, targetInst) {
  activeElement = target;
  activeElementInst = targetInst;
  activeElement.attachEvent('onpropertychange', handlePropertyChange);
}

/**
 * (For IE <=9) Removes the event listeners from the currently-tracked element,
 * if any exists.
 */
function stopWatchingForValueChange() {
  if (!activeElement) {
    return;
  }
  activeElement.detachEvent('onpropertychange', handlePropertyChange);

  activeElement = null;
  activeElementInst = null;
}

/**
 * (For IE <=9) Handles a propertychange event, sending a `change` event if
 * the value of the active element has changed.
 */
function handlePropertyChange(nativeEvent) {
  if (nativeEvent.propertyName !== 'value') {
    return;
  }
  if (getInstIfValueChanged(activeElementInst, nativeEvent)) {
    manualDispatchChangeEvent(nativeEvent);
  }
}

/**
 * SECTION: handle `click` event
 */
function shouldUseClickEvent(elem) {
  // Use the `click` event to detect changes to checkbox and radio inputs.
  // This approach works across all browsers, whereas `change` does not fire
  // until `blur` in IE8.
  var nodeName = elem.nodeName;
  return (
    nodeName &&
    nodeName.toLowerCase() === 'input' &&
    (elem.type === 'checkbox' || elem.type === 'radio')
  );
}

function getTargetInstForClickEvent(topLevelType, targetInst, nativeEvent) {
  if (topLevelType === 'topClick') {
    return getInstIfValueChanged(targetInst, nativeEvent);
  }
}

/**
 * SECTION: handle `blur` event
 */
function handleControlledInputBlur(inst, node) {
  // TODO: In IE, inst is occasionally null. Why?
  if (inst == null) {
    return;
  }

  // Fiber and ReactDOM keep wrapper state in separate places
  let state = inst._wrapperState || node._wrapperState;

  if (!state || !state.controlled || node.type !== 'number') {
    return;
  }

  // If controlled, assign the value attribute to the current value on blur
  let value = '' + node.value;
  if (node.getAttribute('value') !== value) {
    node.setAttribute('value', value);
  }
}

var ChangeEventPlugin = {
  eventTypes,

  _allowSimulatedPassThrough: true,
  _isInputEventSupported: isInputEventSupported,

  extractEvents: function(
    topLevelType,
    targetInst,
    nativeEvent,
    nativeEventTarget
  ) {
    var targetNode = targetInst
      ? ReactDOMComponentTree.getNodeFromInstance(targetInst)
      : window;

    var getTargetInstFunc;
    var handleEventFunc;
    if (shouldUseChangeEvent(targetNode)) {
      if (doesChangeEventBubble) {
        getTargetInstFunc = getTargetInstForChangeEvent;
      } else {
        handleEventFunc = handleEventsForChangeEventIE8;
      }
    } else if (isTextInputElement(targetNode)) {
      if (isInputEventSupported) {
        getTargetInstFunc = getTargetInstForInputOrChangeEvent;
      } else {
        getTargetInstFunc = getTargetInstForInputEventPolyfill;
        handleEventFunc = handleEventsForInputEventPolyfill;
      }
    } else if (shouldUseClickEvent(targetNode)) {
      getTargetInstFunc = getTargetInstForClickEvent;
    }

    if (getTargetInstFunc) {
      var inst = getTargetInstFunc(topLevelType, targetInst, nativeEvent);
      if (inst) {
        var event = createAndAccumulateChangeEvent(
          inst,
          nativeEvent,
          nativeEventTarget
        );
        return event;
      }
    }

    if (handleEventFunc) {
      handleEventFunc(topLevelType, targetNode, targetInst);
    }

    // When blurring, set the value attribute for number inputs
    // read https://github.com/facebook/react/pull/7359/files#r108826984
    // read https://github.com/facebook/react/pull/7359#issuecomment-244768124
    // read HTMLDOMPropertyConfig@DOMMutationMethods
    if (topLevelType === 'topBlur') {
      handleControlledInputBlur(targetInst, targetNode);
    }
  }
};

export default ChangeEventPlugin;
