var http = require('http');
var url = require('url');
var utils = require('./utilities');
var handler = require('./handler'); 

var server = module.exports = http.createServer(function(request, response) {
  var parts = url.parse(request.url);
  if (parts.pathname === '/') {
    handler(request, response);
  } else {
    utils.sendResponse(response, "Not Found", 404);
  }
});

server.listen(8080);