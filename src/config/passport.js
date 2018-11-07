'use strict';
import passport from 'passport'; 
import {localStrategy} from './strategies/local.strategy';
localStrategy();  

export function passportConfig(app) {
  app.use(passport.initialize());
  app.use(passport.session()); 

  passport.serializeUser((user, done) => {
    done(null, user); 
  });

  passport.deserializeUser((user, done) => {
    done(null, user); 
  }); 

}

