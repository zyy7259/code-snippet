import ReactOwner from './ReactOwner';

function attachRef(ref, component, owner) {
  if (typeof ref === 'function') {
    ref(component.getPublicInstance());
  } else {
    // Legacy ref
    ReactOwner.addComponentAsRefTo(component, ref, owner);
  }
}

function detachRef(ref, component, owner) {
  if (typeof ref === 'function') {
    ref(null);
  } else {
    // Legacy ref
    ReactOwner.removeComponentAsRefFrom(component, ref, owner);
  }
}

var ReactRef = {
  attachRefs(instance, element) {
    if (element === null || typeof element !== 'object') {
      return;
    }
    var ref = element.ref;
    if (ref != null) {
      attachRef(ref, instance, element._owner);
    }
  },

  shouldUpdateRefs(prevElement, nextElement) {
    // If either the owner or a `ref` has changed, make sure the newest owner
    // has stored a reference to `this`, and the previous owner (if different)
    // has forgotten the reference to `this`. We use the element instead
    // of the public this.props because the post processing cannot determine
    // a ref. The ref conceptually lives on the element.

    // TODO: Should this even be possible? The owner cannot change because
    // it's forbidden by shouldUpdateReactComponent. The ref can change
    // if you swap the keys of but not the refs. Reconsider where this check
    // is made. It probably belongs where the key checking and
    // instantiateReactComponent is done.

    var prevRef = null;
    var prevOwner = null;
    if (prevElement !== null && typeof prevElement === 'object') {
      prevRef = prevElement.ref;
      prevOwner = prevElement._owner;
    }

    var nextRef = null;
    var nextOwner = null;
    if (nextElement !== null && typeof nextElement === 'object') {
      nextRef = nextElement.ref;
      nextOwner = nextElement._owner;
    }

    return (
      prevRef !== nextRef ||
      // If owner changes but we have an unchanged function ref, don't update refs
      (typeof nextRef === 'string' && nextOwner !== prevOwner)
    );
  },

  detachRefs(instance, element) {
    if (element === null || typeof element !== 'object') {
      return;
    }
    var ref = element.ref;
    if (ref != null) {
      detachRef(ref, instance, element._owner);
    }
  }
};

// @singleton
export default ReactRef;
