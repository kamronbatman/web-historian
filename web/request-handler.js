var path = require('path');
var url = require('url');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var helper = require('./http-helpers.js');
var qs = require('querystring');
var Routes = require('./Routes.js');

exports.handleRequest = function (req, res) {
  new Routes(req, res)
  .def(archive.publicFilePath('index.html'))
  .get('', archive.publicFilePath(url.parse(req.url).pathname) )

  .post('/loading', function(data, rescallback){
    var uri = qs.parse(data).url || qs.parse(data).urlpost;
    if (uri) {
      var checkIsArchived = function(uri){
        archive.isUrlArchived(uri, function(uri,exists){
          if (exists) {
            var loc = { 'Location': archive.archivePath(helper.urlhost(uri)) };
            rescallback(302, helper.headers(null,loc), null);
          } else {
            archive.addUrlToList(helper.urlhost(uri));
            setTimeout(checkIsArchived, 5000);
          }
        });
      }.bind(this, uri);

      setTimeout(checkIsArchived);
    }
  })

  .post('/', function(data, rescallback){
    var uri = qs.parse(data).url || qs.parse(data).urlpost;
    archive.isUrlArchived(uri, function(uri,exists){
        var loc = { 'Location': exists ? archive.archivePath(helper.urlhost(uri))
                                       : archive.publicPath('loading.html?urlpost=' + helper.urlhost(uri)) };
      archive.addUrlToList(helper.urlhost(uri));
      rescallback(302, helper.headers(null,loc), null);
    });
  })

  .get('/archives/sites/', function(data){
    return archive.mainSiteFilePath( helper.urlpath(data) );
  }, '.html')
  .notfound('<h1>You be trippin\' foo!</h1>')
  .next();
}