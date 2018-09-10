var utils = require('./utilities');
var fs = require('fs');
var ejs = require('ejs');
const templatePath = `${__dirname}/../public/views/index.ejs`; 
var htmlData = fs.readFileSync(templatePath, 'utf-8');
var htmlRender = ejs.render(htmlData, {filename: templatePath, title:'Home'});

var actions = {
  'GET': (request, response) => {
    utils.sendResponse(response, htmlRender, 200, {'Content-Type': 'text/html'}); 
  },
  'POST': (request, response) => {
    utils.collectData(request, (formattedData) => {
      //do something
      utils.sendResponse(response, 'Success', 200, {'Content-Type': 'text/plain'});
    });
  }
}; 

module.exports = (request, response) => {
  var action = actions[request.method];
  if (action) {
    action(request, response);
  } else {
    utils.sendResponse(response, "Not Found", 404);
  }
}; 