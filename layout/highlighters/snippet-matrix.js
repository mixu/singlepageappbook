var cheerio = require('cheerio');

var hl = require('./lib/hl.js'),
    rowScale = require('./lib/row-scale.js'),
    getFirstRuleDimensions = require('./lib/get-first-rule-dimensions.js');
    renameCSS = require('./lib/rename-css-classes.js'),
    renameHTML = require('./lib/rename-html-classes.js');

function tuples(arr, count) {
  var result = [];
  for (var i = 0; i + count - 1 < arr.length; i += count) {
    result.push(arr.slice(i, i + count));
  }

  return result;
}

module.exports = function(code, lang) {
  var result = '';
  var re = /(-{3,}\n{0,1})/g,
      parts = code.split(re).filter(function(part) { return !re.test(part); });

  var maxWidth = 640;

  // add wrapping
  var output = '',
      scale;

  console.log(tuples(parts, 2));

  // each part consists of a HTML and CSS block
  var pairs = tuples(parts, 2);
  // get top level div dimensions (from first CSS rule)
  var dims = getFirstRuleDimensions(pairs[0][1]);
  // calculate position and output markup
  scale = rowScale()
              .items(pairs.length)
              .item(dims)
              .parentWidth(maxWidth)
              .padding({ top: 50, left: 20 });

  output += '<div style="position: relative; height: ' + scale.height() + 'px;">';
  pairs.forEach(function(tuple, i) {
    var html = tuple[0],
        css = tuple[1];
    // rename CSS
    var renamed = {};
    css = renameCSS(css, renamed);
    // rename HTML
    var $ = cheerio.load(renameHTML(html, renamed));

    $('div').first().css({
      position: 'absolute',
      top: scale.top(i) + 'px',
      left: scale.left(i) + 'px'
    });
    output += '<style scoped>@import "assets/snippet.css";\n' + css + '</style>';
    output += $.html() + '\n';
  });
  output += '</div>';

  result += output;

  return result;
};
