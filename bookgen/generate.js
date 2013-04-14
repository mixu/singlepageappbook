var fs = require('fs'),
    path = require('path'),
    util = require('util'),
    handlebars = require('handlebars');


var BookGen = function() { };

BookGen.generate = function(config) {
  // get all the files in input
  if(!Array.isArray(config.input.files)) {
    // iterate the path and add all files
    fs.readdir(config.input.files, function (err, files) {
      if (err) throw err;
      BookGen.processFiles(config, files);
    });
  } else {
    BookGen.processFiles(config, config.input.files);
  }
};

BookGen.processFiles = function(config, files) {
  // load the layout
  var header = handlebars.compile(
        fs.readFileSync(config.layout + 'header.hdbs').toString()
      ),
      header_single = handlebars.compile(
        fs.readFileSync(config.layout + 'header_single.hdbs').toString()
      ),
      footer = handlebars.compile(
        fs.readFileSync(config.layout + 'footer.hdbs').toString()
      );

  if(config.input.order == 'sort') {
    // sort the files
    files.sort();
  }
  if(config.input.index) {
    // move the index file first
    var pos = files.indexOf(config.input.index);
    if(pos > -1) {
      files.splice(pos, 1);
      files.unshift(config.input.index);
    }
  }

  // concatenate the files
  console.log(files);

  var prev = 'index.html';
  var full = '';
  files.forEach(function(name, index) {
    if(path.extname(name) != '.html') {
      return;
    }
    var next;
    for(var i = index+1; path.extname(next) != '.html' && i < files.length; i++) {
      next = path.basename(files[i]) || 'index.html';
    }
    var content = fs.readFileSync(name);
    content = content.toString().replace(/%chapter_number%/g, index+'.');



    var opts = {
      title: config.titles[path.basename(name) ] || 'Single page apps in depth',
      prev: prev,
      next: next,
      extras: (path.basename(name) == 'index.html' ?
        fs.readFileSync(__dirname +'/extras.html').toString() : '')
    };
    fs.writeFile(config.output+ path.basename(name), header(opts) + content + footer(opts));
    prev = path.basename(name);

    full += content;
  })

  var opts = {
    title: 'Single page apps in depth (a.k.a. Mixu\' single page app book)',
    prev: '',
    next: '',
    extras: ''
  };

  // write a single page version as well
  fs.writeFile(config.output+'single-page.html', header_single(opts)+full+footer(opts));

  // copy assets
  BookGen.copyDir(config.layout + 'assets/', config.output + 'assets/');
  BookGen.copyDir(config.input.dir + 'assets/', config.output + 'assets/');

};

BookGen.copyDir = function(src, dst) {
  fs.readdir(src, function(err, files) {
    if (err) throw err;
    files.forEach(function(file) {
      // copy
      // console.log(src, dst, file)
      is = fs.createReadStream(src + file);
      os = fs.createWriteStream(dst + file);
      util.pump(is, os);
    });
  });
};


module.exports = BookGen;
