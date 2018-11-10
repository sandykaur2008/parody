'use strict'; 
import passport from 'passport';
import { Strategy } from 'passport-local'; 
import getDB from '../db'; 
import bcrypt from 'bcrypt'; 

export function localStrategy() {
  passport.use(new Strategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    }, (username, password, done) => {
      (async function mongo() {
        try {
          const db = await getDB(); 
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
      }()); 
    }));  
}
