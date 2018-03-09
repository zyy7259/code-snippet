/**
 * ReactOwners are capable of storing references to owned components.
 *
 * All components are capable of //being// referenced by owner components, but
 * only ReactOwner components are capable of //referencing// owned components.
 * The named reference is known as a "ref".
 *
 * Refs are available when mounted and updated during reconciliation.
 *
 *   var MyComponent = React.createClass({
 *     render: function() {
 *       return (
 *         <div onClick={this.handleClick}>
 *           <CustomComponent ref="custom" />
 *         </div>
 *       );
 *     },
 *     handleClick: function() {
 *       this.refs.custom.handleClick();
 *     },
 *     componentDidMount: function() {
 *       this.refs.custom.initialize();
 *     }
 *   });
 *
 * Refs should rarely be used. When refs are used, they should only be done to
 * control data that is not handled by React's data flow.
 *
 * @class ReactOwner
 */
var ReactOwner = {
  addComponentAsRefTo(component, ref, owner) {
    /**
     * Adds a component by ref to an owner component.
     *
     * @param {ReactComponent} component Component to reference.
     * @param {string} ref Name by which to refer to the component.
     * @param {ReactOwner} owner Component on which to record the ref.
     * @final
     * @internal
     */
    owner.attachRef(ref, component);
  },

  removeComponentAsRefFrom(component, ref, owner) {
    /**
     * Removes a component by ref from an owner component.
     *
     * @param {ReactComponent} component Component to dereference.
     * @param {string} ref Name of the ref to remove.
     * @param {ReactOwner} owner Component on which the ref is recorded.
     * @final
     * @internal
     */
    var ownerPublicInstance = owner.getPublicInstance();
    // Check that `component`'s owner is still alive and that `component` is still the current ref
    // because we do not want to detach the ref if another component stole it.
    if (
      ownerPublicInstance &&
      ownerPublicInstance.refs[ref] === component.getPublicInstance()
    ) {
      owner.detachRef(ref);
    }
  }
};

// @singleton
export default ReactOwner;
