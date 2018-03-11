import SyntheticUIEvent from './SyntheticUIEvent';

/**
 * @interface FocusEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var FocusEventInterface = {
  relatedTarget: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
class SyntheticFocusEvent extends SyntheticUIEvent {}

SyntheticUIEvent.augmentClass(SyntheticFocusEvent, FocusEventInterface);

export default SyntheticFocusEvent;
