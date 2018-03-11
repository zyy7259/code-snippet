import SyntheticMouseEvent from './SyntheticMouseEvent';

/**
 * @interface DragEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var DragEventInterface = {
  dataTransfer: null
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native browser event.
 * @extends {SyntheticUIEvent}
 */
class SyntheticDragEvent extends SyntheticMouseEvent {}

SyntheticMouseEvent.augmentClass(SyntheticDragEvent, DragEventInterface);

export default SyntheticDragEvent;
