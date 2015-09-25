var css = require('css');

var counter = 1;

module.exports = function renameCSS(cssText, renamed) {
  if (!renamed) {
    renamed = {};
  }
  var parsed;
  try {
    parsed = css.parse(cssText);
  } catch (e) {
    console.log('css:', cssText);
    throw e;
  }
  parsed.stylesheet.rules.forEach(function(rule) {
    rule.selectors.forEach(function(selector, i) {
      // only handle renaming .class selectors; might be nice to have a real CSS selector parser here..
      if (selector.charAt(0) !== '.') {
        return;
      }
      var classPart = selector.split(/\s/)[0];
      if (!renamed[classPart]) {
        renamed[classPart] = '.' + classPart.substr(1) + '-s' + counter++;
      }
      rule.selectors[i] = rule.selectors[i].replace(classPart, renamed[classPart]);
    })
  });

  return css.stringify(parsed);
};
