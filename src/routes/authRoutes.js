'use strict'; 
import express from 'express';
import * as auth from '../controllers/authController'; 
import passport from 'passport'; 
import { body } from 'express-validator/check'; 
const authRouter = express.Router(); 

export function arouter() {
  authRouter.route('/register')
    .get(auth.getRegister) 
    .post([
      body('username', 'Empty Username Field').not().isEmpty().trim().escape(), 
      body('email', 'Invalid Email').not().isEmpty().isEmail().normalizeEmail(), 
      body('password', 'Password must be at least 5 characters').isLength({ min: 5}).trim().escape()
            .custom((value, {req, loc, path}) => {
              if (value !== req.body.password2) {
                throw new Error('Passwords do not match');
              } else {
                return value;
              }
            })
      ], auth.postRegister); 
  authRouter.route('/login')
   .get(auth.getLogin) 
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
    .get(auth.getLogout); 
  authRouter.route('/forgot')
    .get(auth.getForgot)
    .post([
      body('email', 'Invalid Email').not().isEmpty().isEmail().normalizeEmail()
    ], auth.postForgot); 
  authRouter.route('/reset/:token')
    .get(auth.getReset)
    .post([
      body('password', 'Password must be at least 5 characters').isLength({ min: 5}).trim().escape()
          .custom((value, {req, loc, path}) => {
            if (value !== req.body.password2) {
              throw new Error('Passwords do not match');
            } else {
              return value;
            }
          })
      ], auth.postReset); 
  return authRouter; 
} 

