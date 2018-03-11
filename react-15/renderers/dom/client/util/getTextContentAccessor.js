import ExecutionEnvironment from 'root/shared/util/ExecutionEnvironment';

var contentKey = null;

/**
 * Gets the key used to access text content on a DOM node.
 *
 * @return {?string} Key used to access text content.
 * @internal
 */
function getTextContentAccessor() {
  if (!contentKey && ExecutionEnvironment.canUseDOM) {
    // Prefer textContent to innerText because many browsers support both but
    // SVG <text> elements don't support innerText even when <div> does.
    contentKey =
      'textContent' in document.documentElement ? 'textContent' : 'innerText';
  }
  return contentKey;
}

export default getTextContentAccessor;
