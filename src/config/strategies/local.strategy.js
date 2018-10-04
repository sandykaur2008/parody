'use strict'; 
const passport = require('passport');
const { Strategy } = require('passport-local'); 
const { MongoClient } = require('mongodb'); 
const bcrypt = require('bcrypt'); 
const dotenv = require('dotenv');
dotenv.config();  
const env = process.env.NODE_ENV; 
const envString = env.toUpperCase(); 
const url = 'mongodb://localhost:27017'; 
const { body } = require('express-validator/check'); 
if (envString === 'TEST') {
  var dbName = 'parodyTest';
} 
else {
  var dbName = 'parodyApp';
}

function localStrategy() {
  passport.use(new Strategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    }, (username, password, done) => {
      (async function mongo() {
        let client;

        try {
          client = await MongoClient.connect(url); 

          const db = client.db(dbName); 
          const col = db.collection('users');

          const user = await col.findOne({ username }); 

          if (user === null) {
            done(null, false, {message: 'invalid username'}); 
          }
          else if (bcrypt.compareSync(password, user.password) === true) {
            done(null, user); 
          } else {
            done(null, false, {message: 'invalid password'}); 
          }
        } catch (err) {
          console.log(err.stack); 
        }
        client.close(); 
      }()); 
    }));  
}

module.exports = localStrategy; 