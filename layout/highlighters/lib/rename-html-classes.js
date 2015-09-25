var cheerio = require('cheerio');

module.exports = function renameHTMLClasses(html, renamed) {
  var $ = cheerio.load(html);
  Object.keys(renamed).forEach(function(originalName) {
    var updatedName = renamed[originalName];
    $(originalName).removeClass(originalName.substr(1)).addClass(updatedName.substr(1));
  });
  return $.html();
}
