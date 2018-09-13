'use strict'; 
const express = require('express');
const { MongoClient } = require('mongodb'); 
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
      body('password', 'Password must be at least 5 characters').isLength({ min: 5}),
      body('password2', 'Password must match').equals(body('password'))
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
        const dbName = 'libraryApp'; 
        (async function addUser() {
          let client;
          try {
            client = await MongoClient.connect(url); 
            const db = client.db(dbName); 
            const col = db.collection('users'); 
            const user = { username, password };
            const results = await col.insertOne(user);
            req.login(results.ops[0], () => {
              res.redirect('/auth/profile');
            }); 
          } catch (err) {
              console.log(err); 
            }
          }()); 
      }); 
  authRouter.route('/login')
   .get((req, res) => {
     res.render('login', {
       title: 'Login',
       errors: []
      }); 
    }) 
   .post(passport.authenticate('local', {
     successRedirect: '/auth/profile',
     failureRedirect: '/auth/login'
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