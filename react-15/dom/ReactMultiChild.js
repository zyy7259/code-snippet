import ReactChildReconciler from './ReactChildReconciler';
import ReactReconciler from '../ReactReconciler';

/**
 * ReactMultiChild are capable of reconciling multiple children.
 *
 * Provides common functionality for components that must reconcile multiple
 * children. This is used by `ReactDOMComponent` to mount, update, and
 * unmount child components.
 *
 * @class ReactMultiChild
 * @internal
 */
class ReactMultiChild {
  /**
   * Generates a "mount image" for each of the supplied children. In the case
   * of `ReactDOMComponent`, a mount image is a string of markup.
   *
   * @param {?object} nestedChildren Nested child maps.
   * @return {array} An array of mounted representations.
   * @internal
   */
  mountChildren(nestedChildren, transaction, context) {
    var children = this._reconcilerInstantiateChildren(
      nestedChildren,
      transaction,
      context
    );
    this._renderedChildren = children;

    var mountImages = [];
    var index = 0;
    for (var name in children) {
      if (children.hasOwnProperty(name)) {
        var child = children[name];
        var selfDebugID = 0;
        var mountImage = ReactReconciler.mountComponent(
          child,
          transaction,
          this,
          this._hostContainerInfo,
          context,
          selfDebugID
        );
        child._mountIndex = index++;
        mountImages.push(mountImage);
      }
    }

    return mountImages;
  }

  _reconcilerInstantiateChildren(nestedChildren, transaction, context) {
    return ReactChildReconciler.instantiateChildren(
      nestedChildren,
      transaction,
      context
    );
  }

  /**
   * Unmounts all rendered children. This should be used to clean up children
   * when this component is unmounted. It does not actually perform any
   * backend operations.
   *
   * @internal
   */
  unmountChildren(safely) {
    var renderedChildren = this._renderedChildren;
    ReactChildReconciler.unmountChildren(renderedChildren, safely);
    this._renderedChildren = null;
  }
}

export default ReactMultiChild;
