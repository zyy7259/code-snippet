/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @providesModule ReactTypes
 */

export type ReactNode =
  | React$Element<any>
  | ReactCall<any>
  | ReactReturn<any>
  | ReactPortal
  | ReactText
  | ReactFragment
  | ReactProvider<any>
  | ReactConsumer<any>;

export type ReactFragment = ReactEmpty | Iterable<React$Node>;

export type ReactNodeList = ReactEmpty | React$Node;

export type ReactText = string | number;

export type ReactEmpty = null | void | boolean;

export type ReactCall<V> = {
  $$typeof: Symbol | number,
  type: Symbol | number,
  key: null | string,
  ref: null,
  props: {
    props: any,
    // This should be a more specific CallHandler
    handler: (props: any, returns: Array<V>) => ReactNodeList,
    children?: ReactNodeList,
  },
};

export type ReactReturn<V> = {
  $$typeof: Symbol | number,
  type: Symbol | number,
  key: null,
  ref: null,
  props: {
    value: V,
  },
};

export type ReactProvider<T> = {
  $$typeof: Symbol | number,
  type: ReactProviderType<T>,
  key: null | string,
  ref: null,
  props: {
    value: T,
    children?: ReactNodeList,
  },
};

export type ReactProviderType<T> = {
  $$typeof: Symbol | number,
  context: ReactContext<T>,
};

export type ReactConsumer<T> = {
  $$typeof: Symbol | number,
  type: ReactContext<T>,
  key: null | string,
  ref: null,
  props: {
    children: (value: T) => ReactNodeList,
    bits?: number,
  },
};

export type ReactContext<T> = {
  $$typeof: Symbol | number,
  Consumer: ReactContext<T>,
  Provider: ReactProviderType<T>,

  _calculateChangedBits: ((a: T, b: T) => number) | null,
  _defaultValue: T,

  _currentValue: T,
  _changedBits: number,

  // DEV only
  _currentRenderer?: Object | null,
};

export type ReactPortal = {
  $$typeof: Symbol | number,
  key: null | string,
  containerInfo: any,
  children: ReactNodeList,
  // TODO: figure out the API for cross-renderer implementation.
  implementation: any,
};

export type RefObject = {|
  current: any,
|};

export type DOMContainer =
  | (Element & {
      _reactRootContainer: ?Root,
    })
  | (Document & {
      _reactRootContainer: ?Root,
    });

export type Container = Element | Document;
export type Props = {
  autoFocus?: boolean,
  children?: mixed,
  hidden?: boolean,
  suppressHydrationWarning?: boolean,
};
export type Instance = Element;
export type TextInstance = Text;

export type HostContextDev = {
  namespace: string,
  ancestorInfo: mixed,
};
export type HostContextProd = string;
export type HostContext = HostContextDev | HostContextProd;

export type Batch = FiberRootBatch & {
  render(children: ReactNodeList): Work,
  then(onComplete: () => mixed): void,
  commit(): void,

  // The ReactRoot constuctor is hoisted but the prototype methods are not. If
  // we move ReactRoot to be above ReactBatch, the inverse error occurs.
  // $FlowFixMe Hoisting issue.
  _root: Root,
  _hasChildren: boolean,
  _children: ReactNodeList,

  _callbacks: Array<() => mixed> | null,
  _didComplete: boolean,
};

export type Work = {
  then(onCommit: () => mixed): void,
  _onCommit: () => void,
  _callbacks: Array<() => mixed> | null,
  _didCommit: boolean,
};

export type Root = {
  render(children: ReactNodeList, callback: ?() => mixed): Work,
  unmount(callback: ?() => mixed): Work,
  legacy_renderSubtreeIntoContainer(
    parentComponent: ?React$Component<any, any>,
    children: ReactNodeList,
    callback: ?() => mixed,
  ): Work,
  createBatch(): Batch,

  _internalRoot: FiberRoot,
};
