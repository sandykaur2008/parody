'use strict'; 
const express = require('express');
const nodemailer = require('nodemailer'); 
const dotenv = require('dotenv');
const { body, validationResult } = require('express-validator/check'); 

const mainRouter = express.Router();  

dotenv.config();  
const env = process.env.NODE_ENV; 
const envString = env.toUpperCase(); 

function router() {
  mainRouter.route('/')
    .get((req, res) => {
      res.render('index', {
        title: 'Home',
        messages: req.flash('msg'),
        errors: []
      }); 
    }) 
    .post([
      body('message', 'Empty Message Field').not().isEmpty().trim().escape(), 
      body('fullname', 'Empty Name Field').not().isEmpty().trim().escape(),
      body('email', 'Invalid Email').isEmail().normalizeEmail()
      ], (req, res) => {
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
  return mainRouter; 
}


module.exports = router; 
