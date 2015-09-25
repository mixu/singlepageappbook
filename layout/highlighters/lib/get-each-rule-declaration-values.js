var css = require('css'),
    _ = require('underscore');

module.exports = function getEachRuleDeclarationValues(cssText) {
  // assume the first rule in the common CSS defines the container style
  var parsed = css.parse(cssText),
      firstRule = parsed.stylesheet.rules[0].declarations;

  var results = [];

  parsed.stylesheet.rules.forEach(function(rule) {
    var values = {};

    rule.declarations.forEach(function(declaration) {
      values[declaration.property] = declaration.value;
    });

    results.push(values);
  });

  return results;
};
