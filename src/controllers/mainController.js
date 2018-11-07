'use strict';
import * as main from '../config/main';
import { validationResult } from 'express-validator/check'; 
import dotenv from 'dotenv';
dotenv.config();  
const env = process.env.NODE_ENV; 
const envString = env.toUpperCase(); 

export function getIndex(req, res) {
  res.render('index', {
    title: 'Home',
    messages: req.flash('msg'),
    errors: []
  }); 
}

export function postIndex(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const update = errors.array(); 
    return res.render('index', {
      title: 'Home',
      messages: req.flash('msg'),
      errors: update 
    }); 
  }
  const mailOpts = {
    from: req.body.email, 
    to: process.env['MAIL_USERNAME_' + envString],
    subject: 'Parody site message!',
    text: `${req.body.fullname} (${req.body.email}) says: ${req.body.message}`
  }; 
  main.smtpTrans.sendMail(mailOpts, (error, info) => {
      if (error) {
        req.flash('msg', 'Error Occured');
        console.log(error); 
        return res.redirect('/');
      }
      req.flash('msg', 'Thanks for your email!'); 
      return res.redirect('/'); 
    }); 
  }

  export function getProfile(req, res) {
    if (req.user) {
      main.renderProfile(req.params).then((results) => {
        if (results === null) {
          return res.render('404', {title: '404'}); 
        }
        else {
          return res.render('profile', {
            title: 'Profile',  
            dbUser: results
          }); 
        }
      }); 
    } 
    else {
      res.render('index', {
        title: 'index',
        messages: 'You must register/login to access profile page',
        errors: [] 
      });
    }
}

export function editProfile(req, res) {      
  if (!req.user) {
    res.render('index', {
      title: 'index',
      messages: 'You must register/login to access profile page',
      errors: [] 
    }); 
  } 
  else {
    main.editProfile(req.user).then((results) => {
      return res.render('editprofile', {
        title: "Edit Profile",
        dbUser: results
      }); 
    });  
  }
}

export function postProfile(req, res) {
  const file = (req.file) ? req.file : undefined; 
  main.postProfile(req.body, req.user, file).then((results) => {
    if (results === null) {
      res.render('register', {
        title: 'Register',
        errors: [{msg: 'Username not registered'}]});
    }
    return res.redirect('/profile/'+ results); 
  }); 
} 

export function getDirectory(req, res) {
  if (!req.user) {
    res.render('index', {
      title: 'index',
      messages: 'You must register/login to access directory',
      errors: [] 
    }); 
  } 
  else {
    main.getDirectory(req.query).then((results) => {
      return res.render('directory', {
        title: "Directory",
        users: results
      });
    });  
  } 
}

export function getMessages(req, res) {
  if (!req.user) {
    res.render('index', {
      title: 'index',
      messages: 'You must register/login to access messages',
      errors: [] 
    }); 
  } else {
      res.render('chat', { title: 'Chat'}); 
    }
}  



