var hljs = require('highlight.js');

module.exports = function hl(code, lang) {
  var result;
  if (hljs.getLanguage(lang)) {
    result = hljs.highlight(lang, code, true).value;
  } else {
    result = hljs.highlightAuto(code).value;
  }
  return '<pre class="hljs"><code>' + result + '</code></pre>';
};
