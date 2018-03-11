import SyntheticEvent from 'root/renderers/shared/stack/event/SyntheticEvent';

/**
 * `touchHistory` isn't actually on the native event, but putting it in the
 * interface will ensure that it is cleaned up when pooled/destroyed. The
 * `ResponderEventPlugin` will populate it appropriately.
 */
var ResponderEventInterface = {
  touchHistory: function(nativeEvent) {
    return null; // Actually doesn't even look at the native event.
  }
};

/**
 * @param {object} dispatchConfig Configuration used to dispatch this event.
 * @param {string} dispatchMarker Marker identifying the event target.
 * @param {object} nativeEvent Native event.
 * @extends {SyntheticEvent}
 */
class ResponderSyntheticEvent extends SyntheticEvent {}

SyntheticEvent.augmentClass(ResponderSyntheticEvent, ResponderEventInterface);

export default ResponderSyntheticEvent;
