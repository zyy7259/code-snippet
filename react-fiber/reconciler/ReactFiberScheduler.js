import ReactFiberStack from './ReactFiberStack';
import ReactFiberHostContext from './ReactFiberHostContext';
import ReactFiberLegacyContext from './ReactFiberLegacyContext';
import ReactFiberNewContext from './ReactFiberNewContext';
import ReactFiberHydrationContext from './ReactFiberHydrationContext';
import ReactFiberBeginWork from './ReactFiberBeginWork';
import ReactFiberCompleteWork from './ReactFiberCompleteWork';
import ReactFiberUnwindWork from './ReactFiberUnwindWork';
import ReactFiberCommitWork from './ReactFiberCommitWork';

export default function<T, P, I, TI, HI, PI, C, CC, CX, PL>(
  config: HostConfig<T, P, I, TI, HI, PI, C, CC, CX, PL>
) {
  const stack = ReactFiberStack();
  const hostContext = ReactFiberHostContext(config, stack);
  const legacyContext = ReactFiberLegacyContext(stack);
  const newContext = ReactFiberNewContext(stack);
  const { popHostContext, popHostContainer } = hostContext;
  const {
    popTopLevelContextObject: popTopLevelLegacyContextObject,
    popContextProvider: popLegacyContextProvider
  } = legacyContext;
  const { popProvider } = newContext;
  const hydrationContext: HydrationContext<C, CX> = ReactFiberHydrationContext(
    config
  );
  const { beginWork } = ReactFiberBeginWork(
    config,
    hostContext,
    legacyContext,
    newContext,
    hydrationContext,
    scheduleWork,
    computeExpirationForFiber
  );
  const { completeWork } = ReactFiberCompleteWork(
    config,
    hostContext,
    legacyContext,
    newContext,
    hydrationContext
  );
  const {
    throwException,
    unwindWork,
    unwindInterruptedWork
  } = ReactFiberUnwindWork(
    hostContext,
    legacyContext,
    newContext,
    scheduleWork,
    isAlreadyFailedLegacyErrorBoundary
  );
  const {
    commitResetTextContent,
    commitPlacement,
    commitDeletion,
    commitWork,
    commitLifeCycles,
    commitErrorLogging,
    commitAttachRef,
    commitDetachRef
  } = ReactFiberCommitWork(
    config,
    onCommitPhaseError,
    scheduleWork,
    computeExpirationForFiber,
    markLegacyErrorBoundaryAsFailed,
    recalculateCurrentTime
  );
  const {
    now,
    scheduleDeferredCallback,
    cancelDeferredCallback,
    prepareForCommit,
    resetAfterCommit
  } = config;

  return {
    recalculateCurrentTime,
    computeExpirationForFiber,
    scheduleWork,
    requestWork,
    flushRoot,
    batchedUpdates,
    unbatchedUpdates,
    flushSync,
    flushControlled,
    deferredUpdates,
    syncUpdates,
    interactiveUpdates,
    flushInteractiveUpdates,
    computeUniqueAsyncExpiration,
    legacyContext
  };
}

// TODO
