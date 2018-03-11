import SyntheticUIEvent from './SyntheticUIEvent';

import getEventModifierState from 'root/renderers/dom/client/util/getEventModifierState';

/**
 * @interface TouchEvent
 * @see http://www.w3.org/TR/touch-events/
 */
var TouchEventInterface = {
  touches: null,
  targetTouches: null,
  changedTouches: null,
  altKey: null,
  metaKey: null,
  ctrlKey: null,
  shiftKey: null,
  getModifierState: getEventModifierState
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
class SyntheticTouchEvent extends SyntheticUIEvent {}

SyntheticUIEvent.augmentClass(SyntheticTouchEvent, TouchEventInterface);

export default SyntheticTouchEvent;
