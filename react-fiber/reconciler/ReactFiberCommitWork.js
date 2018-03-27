export default function<T, P, I, TI, HI, PI, C, CC, CX, PL>(
  config: HostConfig<T, P, I, TI, HI, PI, C, CC, CX, PL>,
  captureError: (failedFiber: Fiber, error: mixed) => Fiber | null,
  scheduleWork: (
    fiber: Fiber,
    startTime: ExpirationTime,
    expirationTime: ExpirationTime
  ) => void,
  computeExpirationForFiber: (
    startTime: ExpirationTime,
    fiber: Fiber
  ) => ExpirationTime,
  markLegacyErrorBoundaryAsFailed: (instance: mixed) => void,
  recalculateCurrentTime: () => ExpirationTime
) {
  if (enableMutatingReconciler) {
    return {
      commitResetTextContent,
      commitPlacement,
      commitDeletion,
      commitWork,
      commitLifeCycles,
      commitErrorLogging,
      commitAttachRef,
      commitDetachRef
    };
  } else {
    invariant(false, 'Mutating reconciler is disabled.');
  }
}
