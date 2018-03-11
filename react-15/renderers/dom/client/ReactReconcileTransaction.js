import PooledClass from 'root/shared/util/PooledClass';
import CallbackQueue from 'root/renderers/shared/util/CallbackQueue';
import ReactUpdateQueue from 'root/renderers/shared/stack/reconciler/ReactUpdateQueue';
import ReactBrowserEventEmitter from 'root/renderers/dom/client/ReactBrowserEventEmitter';

/**
 * Ensures that, when possible, the selection range (currently selected text
 * input) is not disturbed by performing the transaction.
 */
var SELECTION_RESTORATION = {
  initialize: ReactInputSelection.getSelectionInformation,
  close: ReactInputSelection.restoreSelection
};

/**
 * Suppresses events (blur/focus) that could be inadvertently dispatched due to
 * high level DOM manipulations (like temporarily removing a text input from the
 * DOM).
 */
var EVENT_SUPPRESSION = {
  initialize: function() {
    var currentlyEnabled = ReactBrowserEventEmitter.isEnabled();
    ReactBrowserEventEmitter.setEnabled(false);
    return currentlyEnabled;
  },
  close: function(previouslyEnabled) {
    ReactBrowserEventEmitter.setEnabled(previouslyEnabled);
  }
};

/**
 * Provides a queue for collecting `componentDidMount` and
 * `componentDidUpdate` callbacks during the transaction.
 */
var ON_DOM_READY_QUEUEING = {
  initialize: function() {
    this.reactMountReady.reset();
  },

  close: function() {
    this.reactMountReady.notifyAll();
  }
};
/**
 * Executed within the scope of the `Transaction` instance. Consider these as
 * being member methods, but with an implied ordering while being isolated from
 * each other.
 */
var TRANSACTION_WRAPPERS = [
  SELECTION_RESTORATION,
  EVENT_SUPPRESSION,
  ON_DOM_READY_QUEUEING
];

/**
 * Currently:
 * - The order that these are listed in the transaction is critical:
 * - Suppresses events.
 * - Restores selection range.
 *
 * Future:
 * - Restore document/overflow scroll positions that were unintentionally
 *   modified via DOM insertions above the top viewport boundary.
 * - Implement/integrate with customized constraint based layout system and keep
 *   track of which dimensions must be remeasured.
 *
 * @class ReactReconcileTransaction
 */
class ReactReconcileTransaction extends Transaction {
  reactMountReady;

  constructor() {
    this.reinitializeTransaction();
    this.reactMountReady = CallbackQueue.getPooled(null);
  }

  getTransactionWrappers() {
    return TRANSACTION_WRAPPERS;
  }

  getReactMountReady() {
    return this.reactMountReady;
  }

  getUpdateQueue() {
    return ReactUpdateQueue;
  }

  /**
   * `PooledClass` looks for this, and will invoke this before allowing this
   * instance to be reused.
   */
  destructor() {
    CallbackQueue.release(this.reactMountReady);
    this.reactMountReady = null;
  }
}

/*
 * will be augmented by PooledClass
 * getPooled is used to construct new instance
 * release is used to destroy an instance
 */
ReactReconcileTransaction.getPooled = () => {
  return new ReactReconcileTransaction();
};
ReactReconcileTransaction.release = () => {};

PooledClass.addPoolingTo(ReactReconcileTransaction);

// @class
export default ReactReconcileTransaction;
