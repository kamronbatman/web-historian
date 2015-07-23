var path = require('path');
var url = require('url');
var fs = require('fs');
var archive = require('../helpers/archive-helpers');
var helper = require('./http-helpers.js');
var s = require('underscore.string');

var Routes = function(req,res){
  this.req = req;
  this.res = res;
  this.url = url.parse(req.url);
  this.queue = [];
};

Routes.prototype.next = function(){
  var nextfunc = this.queue.shift();
  if (nextfunc) { nextfunc(); }
}

Routes.prototype.addFunc = function(func){
  this.queue.push(func);
}

Routes.prototype.notfound = function(data){
  this.addFunc( function(data){
    this.res.writeHead(404, helper.headers('.html'));
    if (data) { this.res.write(data); }
    this.res.end();
  }.bind(this,data));

  return this;
}

Routes.prototype.def = function(filepath) {
  this.def = filepath;
  return this;
}

Routes.prototype.get = function(urlpath, filepath, contenttype) {
  this.addFunc( function(urlpath, filepath, contenttype){
    if ((!this.url.pathname || this.url.pathname === '/') && this.def) { filepath = this.def; }

    if (typeof filepath === 'function') { filepath = filepath(this.url.pathname); }

    if (this.req.method === 'GET' && s.startsWith(this.url.pathname,urlpath)) {
      fs.exists(filepath, function(exists){
        if (exists) {
          fs.readFile(filepath, function(err, data){
            this.res.writeHead(200, helper.headers(contenttype || this.url.pathname));
            if (data) {
              this.res.write(data);
            }

            this.res.end();
          }.bind(this));
        } else { this.next(); }
      }.bind(this));
    } else { this.next(); }

  }.bind(this, urlpath, filepath, contenttype));

  return this;
}

Routes.prototype.post = function(urlpath, callback) {
  this.addFunc( function(urlpath, callback){

    if (this.req.method === 'POST' && s.startsWith(this.url.pathname,urlpath)) {
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
    } else { this.next(); }

  }.bind(this, urlpath, callback));

  return this;
}

module.exports = Routes;