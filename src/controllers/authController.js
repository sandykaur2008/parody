'use strict'; 
const { MongoClient } = require('mongodb'); 
const { validationResult } = require('express-validator/check'); 
const bcrypt = require('bcrypt'); 

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
      const url = 'mongodb://localhost:27017'; 
      const dbName = 'parodyApp'; 

      (async function addUser() {
        let client;
        try {
          client = await MongoClient.connect(url); 
          const db = client.db(dbName); 
          const col = db.collection('users'); 
          const hashedPassword = await bcrypt.hash(password, 10); 
          const user =  { 
            username: username, 
            password: hashedPassword }; 
          const exists = await col.findOne({username: user.username}); 
          console.log(exists);  
          if (exists === null) {
            const results = await col.insertOne(user);
            req.login(results.ops[0], () => {
              res.redirect('/auth/profile');
            });} else {
              return res.render('register', {
                title: 'Register',
                errors: [{msg: 'Username already taken!'}]}); 
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
     function getProfile(req, res) {
      if (req.user) {
        res.render('profile', {
          title: 'Profile', 
          username: req.user.username
        }); 
      } else {
        res.redirect('/'); 
      }
    }
    function getLogout(req, res) {
      req.logout();
      res.redirect('/'); 
    }
  return {
    getRegister,
    postRegister,
    getLogin,
    getProfile,
    getLogout
  }; 
}

module.exports = authController;