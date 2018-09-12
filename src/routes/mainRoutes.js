'use strict'; 
const express = require('express');
const router = express.Router(); 
const nodemailer = require('nodemailer'); 
const dotenv = require('dotenv');

dotenv.config();  
const env = process.env.NODE_ENV; 
const envString = env.toUpperCase(); 

router.get('/', (req, res) => {
  res.render('index', {
    title: 'Home',
    messages: req.flash('msg')
  }); 
}); 

router.post('/', (req, res) => {
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
    from: (req.body.fullname + ' &lt;' + req.body.email + '&gt;'),
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
}); 

module.exports = router; 
