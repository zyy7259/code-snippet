var KeyEscapeUtils = {
  /**
   * Escape and wrap key so it is safe to use as a reactid
   *
   * @param {string} key to be escaped.
   * @return {string} the escaped key.
   */
  escape(key) {
    var escapeRegex = /[=:]/g;
    var escaperLookup = {
      '=': '=0',
      ':': '=2'
    };
    var escapedString = ('' + key).replace(escapeRegex, function(match) {
      return escaperLookup[match];
    });

    return '$' + escapedString;
  },

  /**
   * Unescape and unwrap key for human-readable display
   *
   * @param {string} key to unescape.
   * @return {string} the unescaped key.
   */
  unescape(key) {
    var unescapeRegex = /(=0|=2)/g;
    var unescaperLookup = {
      '=0': '=',
      '=2': ':'
    };
    var keySubstring =
      key[0] === '.' && key[1] === '$' ? key.substring(2) : key.substring(1);

    return ('' + keySubstring).replace(unescapeRegex, function(match) {
      return unescaperLookup[match];
    });
  }
};

module.exports = KeyEscapeUtils;
