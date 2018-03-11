var oneArgumentPooler = function(copyFieldsFrom) {
  var Klass = this;
  if (Klass.instancePool.length) {
    var instance = Klass.instancePool.pop();
    Klass.call(instance, copyFieldsFrom);
    return instance;
  } else {
    return new Klass(copyFieldsFrom);
  }
};

var standardReleaser = function(instance) {
  var Klass = this;
  instance.destructor();
  if (Klass.instancePool.length < Klass.poolSize) {
    Klass.instancePool.push(instance);
  }
};

var PooledClass = {
  /**
   * Augments `CopyConstructor` to be a poolable class, augmenting only the class
   * itself (statically) not adding any prototypical fields. Any CopyConstructor
   * you give this may have a `poolSize` property, and will look for a
   * prototypical `destructor` on instances.
   *
   * @param {Function} CopyConstructor Constructor that can be used to reset.
   * @param {Function} pooler Customizable pooler.
   */
  addPoolingTo(CopyConstructor, pooler = oneArgumentPooler) {
    var NewKlass = CopyConstructor;
    NewKlass.instancePool = [];
    if (!NewKlass.poolSize) {
      NewKlass.poolSize = DEFAULT_POOL_SIZE;
    }
    NewKlass.getPooled = pooler;
    NewKlass.release = standardReleaser;
    return NewKlass;
  },
  oneArgumentPooler,
  twoArgumentPooler,
  threeArgumentPooler,
  fourArgumentPooler
};

// @singleton
export default PooledClass;
