var fs = require('fs');
var url = require('url');
var path = require('path');
var helper = require('../web/http-helpers.js');
var _ = require('underscore');
var request = require('request');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.rawPaths = {
  siteAssets: '../web/public',
  archivedSites: '../web/archives/sites',
  mainSite: '../web',
  list: path.join(__dirname, '../web/archives/sites.txt')
};

exports.paths = {
  siteAssets: path.join(__dirname, exports.rawPaths.siteAssets),
  archivedSites: path.join(__dirname, exports.rawPaths.archivedSites),
  list: exports.rawPaths.list
};

exports.publicPath = function(url) {
  return path.join( '/', url );
}

exports.archivePath = function(url) {
  return path.join( '/archives/sites/', url );
}

exports.mainSiteFilePath = function(url) {
  return path.join( __dirname, exports.rawPaths.mainSite, url );
}

exports.publicFilePath = function(url) {
  return path.join( __dirname, exports.rawPaths.siteAssets, url );
}

exports.archiveFilePath = function(url) {
  return path.join( __dirname, exports.rawPaths.archivedSites, url );
}

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj){
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function(callback){
  fs.readFile(exports.paths.list, 'utf-8', function(err, data) {
    callback(data.split('\n'));
  });
};

exports.isUrlInList = function(uri, callback){
  exports.readListOfUrls(function(sites) {
    callback(_.contains(sites, helper.urlhost(uri)));
  });
};

exports.addUrlToList = function(uri, callback){
  exports.isUrlInList(uri, function(found) {
    if (!found) {
      fs.appendFile(exports.paths.list,helper.urlhost(uri) + '\n', callback);
    }
  });
};

exports.isUrlArchived = function(uri, callback){
  exports.isUrlInList(uri, function(found) {
    fs.exists(exports.archiveFilePath(helper.urlhost(uri)), function(exists){
      callback(uri,exists);
    });
  });
};

exports.downloadUrls = function(urls, callback){
  _.each(urls, function(uri){
    exports.isUrlArchived(uri, function(uri,exists){
      if (!exists) {
        uri = 'http://' + uri;
        request(uri, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            fs.writeFile(exports.archiveFilePath(helper.urlhost(uri)),body, callback);
          }
        })
      }
    })
  });
};
