var path = require('path');
var url = require('url');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var helper = require('./http-helpers.js');
var s = require('underscore.string');
var qs = require('querystring');

exports.handleRequest = function (req, res) {
  new Routes(req, res)
  .def(archive.publicFilePath('index.html'))
  .get('/', archive.publicFilePath(url.parse(req.url).pathname) )
  .post('/', function(data, rescallback){
    archive.isUrlArchived(qs.parse(data).url, function(uri,exists){
        var loc = { 'Location': exists ? archive.archivePath( helper.urlhost(uri) + '.html')
                                       : archive.publicPath('loading.html') };
      archive.addUrlToList(helper.urlhost(uri));
      rescallback(302, helper.headers(null,loc), null);
    })
  })
  .get('/loading/', archive.publicFilePath('loading.html') )
  .get('/archives/sites/', function(data){
    return archive.archiveFilePath( helper.urlhost(data) + '.html');
  });
}

var Routes = function(req,res){
  this.req = req;
  this.res = res;
  this.url = url.parse(req.url);
  this.next = true;
};

Routes.prototype.def = function(filepath) {
  this.def = filepath;
  return this;
}

Routes.prototype.get = function(urlpath, filepath) {
  if ((!this.url.pathname || this.url.pathname === '/') && this.def) { filepath = this.def; }

  if (typeof filepath === 'function') { filepath = filepath(this.url.pathname); }
  if (this.next && this.req.method === 'GET' && s.startsWith(this.url.pathname,urlpath)) {
    fs.readFile(filepath, function(err, data){
      this.res.writeHead(200, helper.headers(this.url.pathname));
      if (data && data.length > 0) {
        this.res.write(data);
      }
      this.res.end();
    }.bind(this));

    this.next = false;
  }

  return this;
}

Routes.prototype.post = function(urlpath, callback) {
  if (this.next && this.req.method === 'POST' && s.startsWith(this.url.pathname,urlpath)) {
    var data = '';

    this.req.on('data', function(chunk){
      data += chunk;
    });

    this.req.on('end', function(){
      callback(data, function(statuscode,headers,body){
        this.res.writeHead(statuscode, headers);
        if (body) {
          this.res.write(body);
        }
        this.res.end();
      }.bind(this));
    }.bind(this));

    this.next = false;
  }

  return this;
}
