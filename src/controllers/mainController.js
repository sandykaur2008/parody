'use strict';
const { validationResult } = require('express-validator/check'); 
const nodemailer = require('nodemailer'); 
const dotenv = require('dotenv');
dotenv.config();  
const env = process.env.NODE_ENV; 
const envString = env.toUpperCase(); 

function mainController() {
  function getIndex(req, res) {
    res.render('index', {
      title: 'Home',
      messages: req.flash('msg'),
      errors: []
    }); 
  }
  function postIndex(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const update = errors.array(); 
      console.log(update); 
      return res.render('index', {
        title: 'Home',
        messages: req.flash('msg'),
        errors: update 
      }); 
    }
    let smtpTrans = nodemailer.createTransport({
      host: process.env['MAIL_SERVER_' + envString],  
      port: process.env['MAIL_PORT_' + envString],
      //secure: process.env['SECURE_' + envString],
      auth: {
        user: process.env['MAIL_USERNAME_' + envString],
        pass: process.env['MAIL_PASSWORD_' + envString]
      }
    });
    let mailOpts = {
      from: req.body.email, 
      to: process.env['MAIL_USERNAME_' + envString],
      subject: 'Parody site message!',
      text: `${req.body.fullname} (${req.body.email}) says: ${req.body.message}`
    }; 
    smtpTrans.sendMail(mailOpts, (error, info) => {
      if (error) {
        req.flash('msg', 'Error Occured');
        console.log(error); 
        return res.redirect('/');
      }
      req.flash('msg', 'Thanks for your email!'); 
      return res.redirect('/'); 
    }); 
  }
  return {
    getIndex,
    postIndex
  }; 
}

module.exports = mainController; 