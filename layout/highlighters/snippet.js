var hl = require('./lib/hl.js');

function clean(markup) {
  return markup.replace(/"/g, '&quot;');
}

module.exports = function(code, lang) {
  var result = '';
  var re = /(-{3,}\n{0,1})/g,
      parts = code.split(re),
      html = parts[0],
      css = parts[2],
      js = parts[4];

  var hasJS = js.trim().length > 0,
      hasCSS  = css.trim().length > 0;

  result += '<div class="snippet-container">' +
       (hasCSS ? '<div class="css">' + hl(css, 'css') + '</div>' : '') +
       '<div class="html">' + hl(html, 'html') + '</div>' +
       (hasJS ? '<div class="js">' + hl(js, 'js') + '</div>' : '') +

       '<div class="result"><iframe srcdoc="' +
       '<!doctype html><html><head>' +
       '<script src=&quot;assets/jquery-1.6.1.min.js&quot;></script>' +
       '<link type=&quot;text/css&quot; rel=&quot;stylesheet&quot; href=&quot;assets/snippet.css&quot;/>' +
       '<style>' + clean(css) +'</style>' +
       clean(html) +
       '<script>' + clean(js) + '</script>' +
       '</body></html>"></iframe></div></div>';

  return result;
};
