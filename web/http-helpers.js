var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var archive = require('../helpers/archive-helpers');
var mime = require('mime-types');
var url = require('url');

exports.headers = function(content, attributes){
  var headers = {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
    "access-control-allow-headers": "content-type, accept",
    "access-control-max-age": 10, // Seconds.
    'Content-Type': mime.lookup(exports.getExt(content)) || "text/html"
  };

  _.extend(headers, attributes);

  return headers;
}

exports.getExt = function(file) {
  return (file && file.slice(file.lastIndexOf('.'))) || '.html';
}

exports.urlhost = function(uri) {
  if (!uri) { return ''; }
  if (uri.indexOf('://') == -1) { uri = 'http://' + uri; }
  return url.parse(uri).hostname;
}

exports.urlpath = function(uri) {
  if (!uri) { return ''; }
  if (uri.indexOf('://') == -1) { uri = 'http://' + uri; }
  return url.parse(uri).pathname;
}

exports.serveAssets = function(res, asset, callback) {
  // Write some code here that helps serve up your static files!
  // (Static files are things like html (yours or archived from others...),
  // css, or anything that doesn't change often.)
};



// As you progress, keep thinking about what helper functions you can put here!
