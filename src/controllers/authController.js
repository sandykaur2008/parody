'use strict'; 
import * as auth from '../config/auth';
import { validationResult } from 'express-validator/check';  

export function getRegister(req, res) {
  res.render('register', {
    title: 'Register',
    errors: []
  });
}

export function postRegister(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const update = errors.array(); 
    return res.render('register', {
      title: 'Register',
      errors: update 
    }); 
  }
  auth.addUser(req.body).then((results) => {
    if (results) {
      req.login(results.ops[0], () => {
        res.redirect('/profile/' + username);
      });} else {
        return res.render('register', {
          title: 'Register',
          errors: [{msg: 'Username/email already registered!'}]}); 
        } 
  }); 
}

export function getLogin(req, res) {
  res.render('login', {
    title: 'Login', 
    message: req.flash('error')
  }); 
}

export function getLogout(req, res) {
  if (!req.user) {
    return res.redirect('/'); 
  } else {
    req.logout();
      return res.redirect('/');
    }
}

export function getForgot(req, res) {
  res.render('forgot', {
    title: 'Reset Password', 
    messages: req.flash('msg'),
    errors: []
  }); 
}
    
export function postForgot(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const update = errors.array(); 
    return res.render('forgot', {
      title: 'Reset Password',
      messages: req.flash('msg'),
      errors: update 
    }); 
  }
  auth.sendReset(req.body, req.headers).then((results) => {
    if (results === null) {
      req.flash('msg', 'Email not registered');
      return res.redirect('/auth/forgot');
    } else  {auth.smtpTrans.sendMail(results, (error, info) => {
      if (error) {
        req.flash('msg', 'Error Occured');
        console.log(error); 
        return res.redirect('/');
      }
      req.flash('msg', 'Reset email sent!'); 
      return res.redirect('/auth/forgot'); 
      });  
    }
  }); 
}

export function getReset(req, res) {
  auth.reset(req.params).then((results) => {
    if (results === null) {
      req.flash('msg', 'Password reset token is invalid or has expired.');
      return res.redirect('/auth/forgot');
    } else {
      return res.render('reset', {
        title: "Reset Password", 
        errors: [],
        token: results
      }); 
    } 
  });
} 

export function postReset(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const update = errors.array(); 
    return res.render('reset', {
      title: 'Reset Password',
      errors: update 
    }); 
  }
  auth.doReset(req.body, req.params).then((results) => {
    if (results === null) {
      req.flash('msg', 'Password reset token is invalid or has expired.');
      return res.redirect('/auth/forgot');
    } else {
      auth.smtpTrans.sendMail(results, (error, info) => {
        if (error) {
          req.flash('msg', 'Error Occured');
          console.log(error); 
          return res.redirect('/');
        }
        req.flash('msg', 'Reset confirmed, please login!'); 
        return res.redirect('/'); 
      });  
    }
  }); 
} 


