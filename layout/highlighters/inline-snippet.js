var css = require('css'),
    _ = require('underscore'),
    cheerio = require('cheerio');

var hl = require('./lib/hl.js'),
    rowScale = require('./lib/row-scale.js'),
    getFirstRuleDimensions = require('./lib/get-first-rule-dimensions.js'),
    getEachRuleDeclarationValues = require('./lib/get-each-rule-declaration-values.js'),
    renameCSS = require('./lib/rename-css-classes.js'),
    renameHTML = require('./lib/rename-html-classes.js');


module.exports = function(code, lang) {
  var result = '';
  var re = /(-{3,}\n{0,1})/g,
      parts = code.split(re),
      html = parts[0],
      cssOriginal = cssCommon = parts[2],
      cssVariants = parts[4];

  // rename the CSS classes in the base HTML
  var renamed = {};
  cssCommon = renameCSS(cssCommon, renamed);
  cssVariants = renameCSS(cssVariants, renamed);

  var $ = cheerio.load(renameHTML(html, renamed));
  // parse the CSS variants to determine the number of blocks to generate
  var rules = css.parse(cssVariants).stylesheet.rules,
      classes = rules.reduce(function(prev, rule) {
        prev = prev.concat(rule.selectors);
        return prev;
      }, []);

  // position the blocks
  var maxWidth = 640;
  var dims = getFirstRuleDimensions(cssCommon);
  var scale = rowScale()
              .items(classes.length)
              .item(dims)
              .parentWidth(maxWidth)
              .padding({ top: 50, left: 20 });

  // generate the html

  var blocks = [];
  var values = getEachRuleDeclarationValues(cssVariants);

  classes.map(function(name) { return name.replace(/^\./, ''); }).forEach(function(name, i) {
    $('div').first().addClass(name).css({
      position: 'absolute',
      top: scale.top(i) + 'px',
      left: scale.left(i) + 'px'
    });

    var valuePairs = _.pairs(values[i]),
        firstPair =  _.first(valuePairs),
        text = firstPair[0] + ': ' + firstPair[1];

    var labelTop = scale.top(i) + 10 + dims.height,
        labelLeft = scale.left(i);
    blocks.push($.html() + '<div style="position: absolute; top: ' + labelTop + 'px; left: ' + labelLeft + 'px; font-size: 16px;">' + text + '</div>');
    $('div').first().removeClass(name);
  });


  result += '<div class="snippet-container">' +
//       '<div class="css">' + hl(cssOriginal, 'css') + '</div>' +
//       '<div class="html">' + hl(html, 'html') + '</div>' +
       '<div class="result" style="position: relative; height: ' + scale.height() + 'px;' +'">' +
        '<script src="assets/jquery-1.6.1.min.js"></script>' +
        '<style scoped>@import "assets/snippet.css";\n' +
        cssCommon + '\n' + cssVariants + '</style>' +
        blocks.join('\n') +
       '</div></div>';

  return result;
};
