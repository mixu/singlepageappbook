var css = require('css'),
    _ = require('underscore');

module.exports = function getFirstRuleDimensions(cssText) {
  // assume the first rule in the common CSS defines the container style
  var parsed = css.parse(cssText),
      firstRule = parsed.stylesheet.rules[0].declarations;

  var maxWidth = 640;
  // discard units, assume px
  var width = parseInt(_.find(firstRule, function(declaration) { return declaration.property === 'width'; }).value, 10),
      height = parseInt(_.find(firstRule, function(declaration) { return declaration.property === 'height'; }).value, 10);

  return { width: width, height: height };
};
