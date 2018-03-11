import SyntheticEvent from 'root/renderers/shared/stack/event/SyntheticEvent';

/**
 * @interface Event
 * @see http://www.w3.org/TR/2009/WD-css3-transitions-20090320/#transition-events-
 * @see https://developer.mozilla.org/en-US/docs/Web/API/TransitionEvent
 */
var TransitionEventInterface = {
  propertyName: null,
  elapsedTime: null,
  pseudoElement: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticEvent}
 */
class SyntheticTransitionEvent extends SyntheticEvent {}

SyntheticEvent.augmentClass(SyntheticTransitionEvent, TransitionEventInterface);

export default SyntheticTransitionEvent;
