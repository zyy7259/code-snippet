import SyntheticEvent from 'root/renderers/shared/stack/event/SyntheticEvent';

/**
 * @interface Event
 * @see http://www.w3.org/TR/css3-animations/#AnimationEvent-interface
 * @see https://developer.mozilla.org/en-US/docs/Web/API/AnimationEvent
 */
var AnimationEventInterface = {
  animationName: null,
  elapsedTime: null,
  pseudoElement: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticEvent}
 */
class SyntheticAnimationEvent extends SyntheticEvent {}

SyntheticEvent.augmentClass(SyntheticAnimationEvent, AnimationEventInterface);

export default SyntheticAnimationEvent;
