var marked = require('marked');

var i = 0;

module.exports = function(code, lang) {
  i++;
  return '<div class="spoiler-container"><input type="checkbox" class="spoiler" id="spoiler-' + i + '"/>' +
         '<label for="spoiler-' + i + '">Show answer</label><div class="spoiler-content">' +
         marked(code.trim()) +
         '</div></div>';
};
