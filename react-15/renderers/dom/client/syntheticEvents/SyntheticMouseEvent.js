import SyntheticUIEvent from './SyntheticUIEvent';
import ViewportMetrics from 'root/renderers/dom/client/util/ViewportMetrics';

/**
 * @interface MouseEvent
 * @see http://www.w3.org/TR/DOM-Level-3-Events/
 */
var MouseEventInterface = {
  screenX: null,
  screenY: null,
  clientX: null,
  clientY: null,
  ctrlKey: null,
  shiftKey: null,
  altKey: null,
  metaKey: null,
  getModifierState: getEventModifierState,
  button: function(event) {
    // Webkit, Firefox, IE9+
    // which:  1 2 3
    // button: 0 1 2 (standard)
    var button = event.button;
    if ('which' in event) {
      return button;
    }
    // IE<9
    // which:  undefined
    // button: 0 0 0
    // button: 1 4 2 (onmouseup)
    return button === 2 ? 2 : button === 4 ? 1 : 0;
  },
  buttons: null,
  relatedTarget: function(event) {
    return (
      event.relatedTarget ||
      (event.fromElement === event.srcElement
        ? event.toElement
        : event.fromElement)
    );
  },
  // "Proprietary" Interface.
  pageX: function(event) {
    return 'pageX' in event
      ? event.pageX
      : event.clientX + ViewportMetrics.currentScrollLeft;
  },
  pageY: function(event) {
    return 'pageY' in event
      ? event.pageY
      : event.clientY + ViewportMetrics.currentScrollTop;
  }
};

class SyntheticMouseEvent extends SyntheticUIEvent {}

SyntheticUIEvent.augmentClass(SyntheticMouseEvent, MouseEventInterface);

export default SyntheticMouseEvent;
