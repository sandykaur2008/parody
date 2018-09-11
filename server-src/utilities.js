const { parse } = require('querystring'); 

exports.sendResponse = (response, data, statusCode, headers) => {
  response.writeHead(statusCode, headers);
  response.end(data);
}; 

exports.collectData = (request, callback) => {
  var data = '';
  request.on('data', (chunk) => {
    data += chunk.toString();
  });
  request.on('end', () => {
    callback(parse(data));
  });
}; 