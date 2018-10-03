'use strict'; 
const express = require('express');
const authController = require('../controllers/authController'); 
const passport = require('passport'); 
const { body } = require('express-validator/check'); 
const authRouter = express.Router(); 

function router() {
  const { getRegister, postRegister, getLogin,
     getLogout, getForgot, postForgot, getReset, postReset } = authController(); 
  authRouter.route('/register')
    .get(getRegister) 
    .post([
      body('username', 'Empty Username Field').not().isEmpty().trim().escape(), 
      body('email', 'Invalid Email').not().isEmpty().isEmail().normalizeEmail(), 
      body('password', 'Password must be at least 5 characters').isLength({ min: 5})
            .custom((value, {req, loc, path}) => {
              if (value !== req.body.password2) {
                throw new Error('Passwords do not match');
              } else {
                return value;
              }
            })
      ], postRegister); 
  authRouter.route('/login')
   .get(getLogin) 
   .post(passport.authenticate('local', {
     failureRedirect: '/auth/login',
     failureFlash: true
    }), 
      function (req, res) {
        var username = req.user.username;
        var successRedirect = '/profile/' + username; 
        res.redirect(successRedirect); 
      });  
  authRouter.route('/logout')
    .get(getLogout); 
  authRouter.route('/forgot')
    .get(getForgot)
    .post([
      body('email', 'Invalid Email').not().isEmpty().isEmail().normalizeEmail()
    ], postForgot); 
  authRouter.route('/reset/:token')
    .get(getReset)
    .post([
      body('password', 'Password must be at least 5 characters').isLength({ min: 5})
          .custom((value, {req, loc, path}) => {
            if (value !== req.body.password2) {
              throw new Error('Passwords do not match');
            } else {
              return value;
            }
          })
      ], postReset); 
  return authRouter; 
  } 

module.exports = router; 