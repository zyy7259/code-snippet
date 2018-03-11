import ExecutionEnvironment from 'root/shared/util/ExecutionEnvironment';
import escapeTextContentForBrowser from 'root/renderers/dom/shared/escapeTextContentForBrowser';
import setInnerHTML from './setInnerHTML';

/**
 * Set the textContent property of a node, ensuring that whitespace is preserved
 * even in IE8. innerText is a poor substitute for textContent and, among many
 * issues, inserts <br> instead of the literal newline chars. innerHTML behaves
 * as it should.
 *
 * @param {DOMElement} node
 * @param {string} text
 * @internal
 */
var setTextContent = function(node, text) {
  if (text) {
    var firstChild = node.firstChild;

    if (
      firstChild &&
      firstChild === node.lastChild &&
      firstChild.nodeType === 3
    ) {
      firstChild.nodeValue = text;
      return;
    }
  }
  node.textContent = text;
};

if (ExecutionEnvironment.canUseDOM) {
  if (!('textContent' in document.documentElement)) {
    setTextContent = function(node, text) {
      if (node.nodeType === 3) {
        node.nodeValue = text;
        return;
      }
      setInnerHTML(node, escapeTextContentForBrowser(text));
    };
  }
}

export default setTextContent;
