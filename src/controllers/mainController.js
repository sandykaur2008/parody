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
  function getProfile(req, res) {
    if (req.user) {
      res.render('profile', {
        title: 'Profile', 
      }); 
    } else {
      res.redirect('/'); 
    }
  }
  function editProfile(req, res) {
    if (req.user) {
      res.render('editprofile', {
        title: "Edit Profile"
      }); 
      } else {
        res.redirect('/'); 
      } 
  }
  function postProfile(req, res) {
    const weakness = req.body.weakness;
    const output = Object.values(weakness).forEach(value => {
      if (!Array.isArray(value)) {
        return Array.from(value); 
      }
      }); 
    console.log(output); 
    const strength = req.body.strength; 
    const allergy = req.body.allergy; 
    const qualm = req.body.qualm; 
    const spirit = req.body.spirit; 
    const url = 'mongodb://localhost:27017'; 
    const dbName = 'parodyApp'; 

    /*(async function editProfile() {
      let client;
      try {
        client = await MongoClient.connect(url); 
        const db = client.db(dbName); 
        const col = db.collection('users'); 
        const hashedPassword = await bcrypt.hash(password, 10); 
        const user =  { 
          username: username, 
          password: hashedPassword,
          email: email }; 
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
      }()); */
  }
  return {
    getIndex,
    postIndex,
    getProfile,
    editProfile,
    postProfile
  }; 
}

module.exports = mainController; 