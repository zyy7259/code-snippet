export default function<T, P, I, TI, HI, PI, C, CC, CX, PL>(
  config: HostConfig<T, P, I, TI, HI, PI, C, CC, CX, PL>,
  hostContext: HostContext<C, CX>,
  legacyContext: LegacyContext,
  newContext: NewContext,
  hydrationContext: HydrationContext<C, CX>,
  scheduleWork: (fiber: Fiber, expirationTime: ExpirationTime) => void,
  computeExpirationForFiber: (fiber: Fiber) => ExpirationTime
) {
  function beginWork(
    current: Fiber | null,
    workInProgress: Fiber,
    renderExpirationTime: ExpirationTime
  ): Fiber | null {
    if (
      workInProgress.expirationTime === NoWork ||
      workInProgress.expirationTime > renderExpirationTime
    ) {
      return bailoutOnLowPriority(current, workInProgress);
    }

    switch (workInProgress.tag) {
      case IndeterminateComponent:
        return mountIndeterminateComponent(
          current,
          workInProgress,
          renderExpirationTime
        );
      case FunctionalComponent:
        return updateFunctionalComponent(current, workInProgress);
      case ClassComponent:
        return updateClassComponent(
          current,
          workInProgress,
          renderExpirationTime
        );
      case HostRoot:
        return updateHostRoot(current, workInProgress, renderExpirationTime);
      case HostComponent:
        return updateHostComponent(
          current,
          workInProgress,
          renderExpirationTime
        );
      case HostText:
        return updateHostText(current, workInProgress);
      case CallHandlerPhase:
        // This is a restart. Reset the tag to the initial phase.
        workInProgress.tag = CallComponent;
      // Intentionally fall through since this is now the same.
      case CallComponent:
        return updateCallComponent(
          current,
          workInProgress,
          renderExpirationTime
        );
      case ReturnComponent:
        // A return component is just a placeholder, we can just run through the
        // next one immediately.
        return null;
      case HostPortal:
        return updatePortalComponent(
          current,
          workInProgress,
          renderExpirationTime
        );
      case ForwardRef:
        return updateForwardRef(current, workInProgress);
      case Fragment:
        return updateFragment(current, workInProgress);
      case Mode:
        return updateMode(current, workInProgress);
      case ContextProvider:
        return updateContextProvider(
          current,
          workInProgress,
          renderExpirationTime
        );
      case ContextConsumer:
        return updateContextConsumer(
          current,
          workInProgress,
          renderExpirationTime
        );
      default:
        invariant(
          false,
          'Unknown unit of work tag. This error is likely caused by a bug in ' +
            'React. Please file an issue.'
        );
    }
  }

  return {
    beginWork
  };
}

// TODO:
