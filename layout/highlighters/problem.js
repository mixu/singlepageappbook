var fs = require('fs'),
    path = require('path'),
    problemDir = path.normalize(__dirname + '../../../problems/'),
    marked = require('marked');

module.exports = function(code, lang) {
  return '<hr>' +
         marked(fs.readFileSync(problemDir + code.trim(), 'utf8')) +
         '<hr><br>';
};
