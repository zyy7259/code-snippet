var canDefineProperty = false;
if (__DEV__) {
  try {
    // $FlowFixMe https://github.com/facebook/flow/issues/285
    Object.defineProperty({}, 'x', { get: function() {} });
    canDefineProperty = true;
  } catch (x) {
    // IE will fail on defineProperty
  }
}

export default canDefineProperty;
