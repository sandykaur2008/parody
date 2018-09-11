var utils = require('./utilities');
var fs = require('fs');
var ejs = require('ejs');
const templatePath = `${__dirname}/../public/views/index.ejs`; 
var htmlData = fs.readFileSync(templatePath, 'utf-8');
var htmlRender = ejs.render(htmlData, {filename: templatePath, title:'Home'});
const nodemailer = require('nodemailer'); 

var actions = {
  'GET': (request, response) => {
    utils.sendResponse(response, htmlRender, 200, {'Content-Type': 'text/html'}); 
  },
  'POST': (request, response) => {
    utils.collectData(request, (formattedData) => {
      nodemailer.createTestAccount((err, account) => {
        let transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: account.user,
            pass: account.pass
          }
        }); 
        let mailOptions = {
          from: formattedData.email,
          to: 'sandykaur2008@gmail.com',
          subject: 'feedback',
          text: 'Message from' + formattedData.fullname + formattedData.message,
        }; 
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log('Message sent: %s', mailOptions.text);
        }); 
      });
      utils.sendResponse(response, 'Success', 302, {'Content-Type': 'text/html'});
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