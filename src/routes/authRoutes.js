'use strict'; 
const express = require('express');
const authController = require('../controllers/authController'); 
const passport = require('passport'); 
const { body } = require('express-validator/check'); 
const authRouter = express.Router(); 

function router() {
  const { getRegister, postRegister, getLogin, getProfile, getLogout } = authController(); 
  authRouter.route('/register')
    .get(getRegister) 
    .post([
      body('username', 'Empty Username Field').not().isEmpty().trim().escape(), 
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
     successRedirect: '/auth/profile',
     failureRedirect: '/auth/login',
     failureFlash: true
    }));  
  authRouter.route('/profile')
    .get(getProfile);  
  authRouter.route('/logout')
    .get(getLogout); 
  return authRouter; 
  } 

module.exports = router; 