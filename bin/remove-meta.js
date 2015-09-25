#!/usr/bin/env node
var md = require('markdown-stream-utils'),
    pi = require('pipe-iterators');

process.stdin.setEncoding('utf8');

process.stdin
  .pipe(pi.reduce(function(obj, current) {
    obj.contents += current;
    return obj;
  }, { content:  '' }))
  .pipe(md.parseHeader())
  .pipe(pi.map(function(obj) { return obj.contents; }))
  .pipe(process.stdout);

