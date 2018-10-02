'use strict'; 
const { MongoClient } = require('mongodb'); 
const { validationResult } = require('express-validator/check'); 
const url = 'mongodb://localhost:27017'; 
const bcrypt = require('bcrypt'); 
const crypto = require('crypto'); 
const nodemailer = require('nodemailer'); 
const dotenv = require('dotenv');
dotenv.config();  
const env = process.env.NODE_ENV; 
const envString = env.toUpperCase(); 
if (envString === 'TEST') {
  var dbName = 'parodyTest';
} 
else {
  var dbName = 'parodyApp';
}

function authController() {
  function getRegister(req, res) {
    res.render('register', {
      title: 'Register',
      errors: []
    });
  }
  function postRegister(req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const update = errors.array(); 
        console.log(update); 
        return res.render('register', {
          title: 'Register',
          errors: update 
        }); 
      }
      const username = req.body.username;
      const password = req.body.password; 
      const email = req.body.email; 

      (async function addUser() {
        let client;
        try {
          client = await MongoClient.connect(url); 
          const db = client.db(dbName); 
          const col = db.collection('users'); 
          const hashedPassword = await bcrypt.hash(password, 10); 
          const user =  { 
            imagePath: '/images/uploads/default.png',
            username: username, 
            password: hashedPassword,
            email: email,
            allergy: [
              ["0", null],
              ["0", null],
              ["0", null],
              ["0", null],
              ["0", null]
            ],
            qualm: [
              ["0", null],
              ["0", null],
              ["0", null],
              ["0", null],
            ],
            spirit: [
              ["0", null],
              ["0", null],
              ["0", null],
            ],
            strength: [
              ["0", null],
              ["0", null],
              ["0", null],
              ["0", null],
              ["0", null]
            ],
            weakness: [
              ["0", null],
              ["0", null],
              ["0", null],
              ["0", null],
              ["0", null]
            ]}; 
          const usernameExists = await col.findOne({username: user.username}); 
          const emailExists = await col.findOne({ email: user.email }); 
          if (usernameExists === null && emailExists === null) {
            const results = await col.insertOne(user);
            console.log(results); 
            req.login(results.ops[0], () => {
              res.redirect('/profile');
            });} else {
              return res.render('register', {
                title: 'Register',
                errors: [{msg: 'Username/email already registered!'}]}); 
            } 
        } catch (err) {
          debug(err); 
        }
        }()); 
    }
    function getLogin(req, res) {
      res.render('login', {
        title: 'Login', 
        message: req.flash('error')
       }); 
     }
    function getLogout(req, res) {
      req.logout();
      res.redirect('/'); 
    }
    function getForgot(req, res) {
      res.render('forgot', {
        title: 'Reset Password', 
        messages: req.flash('msg'),
        errors: []
      }); 
    }
    function postForgot(req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const update = errors.array(); 
        console.log(update); 
        return res.render('forgot', {
          title: 'Reset Password',
          messages: req.flash('msg'),
          errors: update 
        }); 
      }

      const email = req.body.email; 
      (async function sendReset() {
        let client;
        try {
          client = await MongoClient.connect(url); 
          const db = client.db(dbName); 
          const col = db.collection('users'); 
          
          const user = await col.findOne({ email: email }); 
          if (user === null) {
            req.flash('msg', 'Email not registered');
            return res.redirect('/auth/forgot');
            } else {
              var token = crypto.randomBytes(20).toString('hex'); 
              await col.updateOne(
                { email: user.email },
                {
                  $set: {resetToken: token, expires: Date.now() + 300000}
                }
              );
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
                from: "parody@reset.com", 
                to: user.email,
                subject: 'Parody site reset!',
                text: 'You are receiving this because you have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/auth/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
              }; 
              smtpTrans.sendMail(mailOpts, (error, info) => {
                if (error) {
                  req.flash('msg', 'Error Occured');
                  console.log(error); 
                  return res.redirect('/');
                }
                req.flash('msg', 'Reset email sent!'); 
                return res.redirect('/auth/forgot'); 
              });  
            } 
        } catch (err) {
          debug(err); 
        }
        }()); 
    }
    function getReset(req, res) {

      (async function reset() {
        let client;
        try {
          client = await MongoClient.connect(url); 
          const db = client.db(dbName); 
          const col = db.collection('users'); 
          
          const user = await col.findOne({ resetToken: req.params.token,
          expires: { $gt: Date.now() }  }); 
          if (user === null) {
            req.flash('msg', 'Password reset token is invalid or has expired.');
            return res.redirect('/auth/forgot');
            } else {
              return res.render('reset', {
                title: "Reset Password", 
                errors: [],
                token: user.resetToken}); 
            } 
        } catch (err) {
          debug(err); 
        }
        }()); 
    }
    function postReset(req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const update = errors.array(); 
        console.log(update); 
        return res.render('reset', {
          title: 'Reset Password',
          errors: update 
        }); 
      }

      const password = req.body.password; 


      (async function doReset() {
        let client;
        try {
          client = await MongoClient.connect(url); 
          const db = client.db(dbName); 
          const col = db.collection('users'); 
          const hashedPassword = await bcrypt.hash(password, 10);
          const user = await col.findOne({ resetToken: req.params.token,
            expires: { $gt: Date.now() }  }); 
          if (user === null) {
            req.flash('msg', 'Password reset token is invalid or has expired.');
            return res.redirect('/auth/forgot');
            } else {
              var token = undefined; 
              await col.updateOne(
                { username: user.username },
                {
                  $set: {password: hashedPassword, resetToken: token, expires: undefined}
                }
              );
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
                from: "parody@reset.com", 
                to: user.email,
                subject: 'Parody site reset!',
                text: 'This is confirmation that your password has been reset'
              }; 
              smtpTrans.sendMail(mailOpts, (error, info) => {
                if (error) {
                  req.flash('msg', 'Error Occured');
                  console.log(error); 
                  return res.redirect('/');
                }
                req.flash('msg', 'Reset confirmed, please login!'); 
                return res.redirect('/'); 
              });  
            } 
        } catch (err) {
          debug(err); 
        }
        }()); 
    }
  return {
    getRegister,
    postRegister,
    getLogin,
    getLogout,
    getForgot,
    postForgot,
    getReset,
    postReset
  }; 
}

module.exports = authController;