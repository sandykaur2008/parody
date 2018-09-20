'use strict'; 
const express = require('express');
const { MongoClient } = require('mongodb'); 
const debug = require('debug')('app:authRoutes');
const passport = require('passport'); 
const { body, validationResult } = require('express-validator/check'); 

const authRouter = express.Router(); 

function router() {
  authRouter.route('/register')
    .get((req, res) => {
      res.render('register', {
        title: 'Register',
        errors: []
      });
    }) 
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
      ], (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          const update = errors.array(); 
          console.log(update); 
          return res.render('register', {
            title: 'Register',
            errors: update 
          }); 
        }
        const { username, password } = req.body; 
        const url = 'mongodb://localhost:27017'; 
        const dbName = 'parodyApp'; 

        (async function addUser() {
          let client;
          try {
            client = await MongoClient.connect(url); 
            const db = client.db(dbName); 
            const col = db.collection('users'); 
            const user = { username, password };
            const results = await col.insertOne(user);
            debug(results); 
            req.login(results.ops[0], () => {
              res.redirect('/auth/profile');
            }); 
          } catch (err) {
              debug(err); 
            }
          }()); 
      }); 
  authRouter.route('/login')
   .get((req, res) => {
     res.render('login', {
       title: 'Login', 
       message: req.flash('error')
      }); 
    }) 
   .post(passport.authenticate('local', {
     successRedirect: '/auth/profile',
     failureRedirect: '/auth/login',
     failureFlash: true
    }));  
  authRouter.route('/profile')
    .all((req, res, next) => {
      if (req.user) {
        next(); 
      } else {
        res.redirect('/'); 
      }
    }) 
    .get((req, res) => {
      res.json(req.user); 
    }); 
  return authRouter; 
  } 

module.exports = router; 