export default function<T, P, I, TI, HI, PI, C, CC, CX, PL>(
  config: HostConfig<T, P, I, TI, HI, PI, C, CC, CX, PL>,
  hostContext: HostContext<C, CX>,
  legacyContext: LegacyContext,
  newContext: NewContext,
  hydrationContext: HydrationContext<C, CX>
) {
  function completeWork(
    current: Fiber | null,
    workInProgress: Fiber,
    renderExpirationTime: ExpirationTime
  ): Fiber | null {
    const newProps = workInProgress.pendingProps;
    switch (workInProgress.tag) {
      case FunctionalComponent:
        return null;
      case ClassComponent: {
        // We are leaving this subtree, so pop context if any.
        popLegacyContextProvider(workInProgress);

        // If this component caught an error, schedule an error log effect.
        const instance = workInProgress.stateNode;
        const updateQueue = workInProgress.updateQueue;
        if (updateQueue !== null && updateQueue.capturedValues !== null) {
          workInProgress.effectTag &= ~DidCapture;
          if (typeof instance.componentDidCatch === 'function') {
            workInProgress.effectTag |= ErrLog;
          } else {
            // Normally we clear this in the commit phase, but since we did not
            // schedule an effect, we need to reset it here.
            updateQueue.capturedValues = null;
          }
        }
        return null;
      }
      case HostRoot: {
        popHostContainer(workInProgress);
        popTopLevelLegacyContextObject(workInProgress);
        const fiberRoot = (workInProgress.stateNode: FiberRoot);
        if (fiberRoot.pendingContext) {
          fiberRoot.context = fiberRoot.pendingContext;
          fiberRoot.pendingContext = null;
        }
        if (current === null || current.child === null) {
          // If we hydrated, pop so that we can delete any remaining children
          // that weren't hydrated.
          popHydrationState(workInProgress);
          // This resets the hacky state to fix isMounted before committing.
          // TODO: Delete this when we delete isMounted and findDOMNode.
          workInProgress.effectTag &= ~Placement;
        }
        updateHostContainer(workInProgress);

        const updateQueue = workInProgress.updateQueue;
        if (updateQueue !== null && updateQueue.capturedValues !== null) {
          workInProgress.effectTag |= ErrLog;
        }
        return null;
      }
      case HostComponent: {
        popHostContext(workInProgress);
        const rootContainerInstance = getRootHostContainer();
        const type = workInProgress.type;
        if (current !== null && workInProgress.stateNode != null) {
          // If we have an alternate, that means this is an update and we need to
          // schedule a side-effect to do the updates.
          const oldProps = current.memoizedProps;
          // If we get updated because one of our children updated, we don't
          // have newProps so we'll have to reuse them.
          // TODO: Split the update API as separate for the props vs. children.
          // Even better would be if children weren't special cased at all tho.
          const instance: I = workInProgress.stateNode;
          const currentHostContext = getHostContext();
          // TODO: Experiencing an error where oldProps is null. Suggests a host
          // component is hitting the resume path. Figure out why. Possibly
          // related to `hidden`.
          const updatePayload = prepareUpdate(
            instance,
            type,
            oldProps,
            newProps,
            rootContainerInstance,
            currentHostContext
          );

          updateHostComponent(
            current,
            workInProgress,
            updatePayload,
            type,
            oldProps,
            newProps,
            rootContainerInstance,
            currentHostContext
          );

          if (current.ref !== workInProgress.ref) {
            markRef(workInProgress);
          }
        } else {
          if (!newProps) {
            invariant(
              workInProgress.stateNode !== null,
              'We must have new props for new mounts. This error is likely ' +
                'caused by a bug in React. Please file an issue.'
            );
            // This can happen when we abort work.
            return null;
          }

          const currentHostContext = getHostContext();
          // TODO: Move createInstance to beginWork and keep it on a context
          // "stack" as the parent. Then append children as we go in beginWork
          // or completeWork depending on we want to add then top->down or
          // bottom->up. Top->down is faster in IE11.
          let wasHydrated = popHydrationState(workInProgress);
          if (wasHydrated) {
            // TODO: Move this and createInstance step into the beginPhase
            // to consolidate.
            if (
              prepareToHydrateHostInstance(
                workInProgress,
                rootContainerInstance,
                currentHostContext
              )
            ) {
              // If changes to the hydrated node needs to be applied at the
              // commit-phase we mark this as such.
              markUpdate(workInProgress);
            }
          } else {
            let instance = createInstance(
              type,
              newProps,
              rootContainerInstance,
              currentHostContext,
              workInProgress
            );

            appendAllChildren(instance, workInProgress);

            // Certain renderers require commit-time effects for initial mount.
            // (eg DOM renderer supports auto-focus for certain elements).
            // Make sure such renderers get scheduled for later work.
            if (
              finalizeInitialChildren(
                instance,
                type,
                newProps,
                rootContainerInstance,
                currentHostContext
              )
            ) {
              markUpdate(workInProgress);
            }
            workInProgress.stateNode = instance;
          }

          if (workInProgress.ref !== null) {
            // If there is a ref on a host node we need to schedule a callback
            markRef(workInProgress);
          }
        }
        return null;
      }
      case HostText: {
        let newText = newProps;
        if (current && workInProgress.stateNode != null) {
          const oldText = current.memoizedProps;
          // If we have an alternate, that means this is an update and we need
          // to schedule a side-effect to do the updates.
          updateHostText(current, workInProgress, oldText, newText);
        } else {
          if (typeof newText !== 'string') {
            invariant(
              workInProgress.stateNode !== null,
              'We must have new props for new mounts. This error is likely ' +
                'caused by a bug in React. Please file an issue.'
            );
            // This can happen when we abort work.
            return null;
          }
          const rootContainerInstance = getRootHostContainer();
          const currentHostContext = getHostContext();
          let wasHydrated = popHydrationState(workInProgress);
          if (wasHydrated) {
            if (prepareToHydrateHostTextInstance(workInProgress)) {
              markUpdate(workInProgress);
            }
          } else {
            workInProgress.stateNode = createTextInstance(
              newText,
              rootContainerInstance,
              currentHostContext,
              workInProgress
            );
          }
        }
        return null;
      }
      case CallComponent:
        return moveCallToHandlerPhase(
          current,
          workInProgress,
          renderExpirationTime
        );
      case CallHandlerPhase:
        // Reset the tag to now be a first phase call.
        workInProgress.tag = CallComponent;
        return null;
      case ReturnComponent:
        // Does nothing.
        return null;
      case ForwardRef:
        return null;
      case Fragment:
        return null;
      case Mode:
        return null;
      case HostPortal:
        popHostContainer(workInProgress);
        updateHostContainer(workInProgress);
        return null;
      case ContextProvider:
        // Pop provider fiber
        popProvider(workInProgress);
        return null;
      case ContextConsumer:
        return null;
      // Error cases
      case IndeterminateComponent:
        invariant(
          false,
          'An indeterminate component should have become determinate before ' +
            'completing. This error is likely caused by a bug in React. Please ' +
            'file an issue.'
        );
      // eslint-disable-next-line no-fallthrough
      default:
        invariant(
          false,
          'Unknown unit of work tag. This error is likely caused by a bug in ' +
            'React. Please file an issue.'
        );
    }
  }

  return {
    completeWork
  };
}

// TODO:
