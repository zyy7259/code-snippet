import KeyEscapeUtils from './KeyEscapeUtils';
import traverseAllChildren from './traverseAllChildren';

/**
 * @param {function} traverseContext Context passed through traversal.
 * @param {?ReactComponent} child React child component.
 * @param {!string} name String name of key path to child.
 * @param {number=} selfDebugID Optional debugID of the current internal instance.
 */
function flattenSingleChildIntoContext(
  traverseContext,
  child,
  name,
  selfDebugID
) {
  // We found a component instance.
  if (traverseContext && typeof traverseContext === 'object') {
    const result = traverseContext;
    const keyUnique = result[name] === undefined;
    if (keyUnique && child != null) {
      result[name] = child;
    }
  }
}

/**
 * Flattens children that are typically specified as `props.children`. Any null
 * children will not be included in the resulting object.
 * @return {!object} flattened children keyed by name.
 */
function flattenChildren(children, selfDebugID) {
  if (children == null) {
    return children;
  }
  var result = {};

  traverseAllChildren(children, flattenSingleChildIntoContext, result);
  return result;
}

export default flattenChildren;
