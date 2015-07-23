var archive = require('../helpers/archive-helpers');

//setInterval(function(){
    archive.readListOfUrls(function(data) {
    archive.downloadUrls(data);
  });
//}, 1000);