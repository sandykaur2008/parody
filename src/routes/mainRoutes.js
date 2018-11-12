'use strict'; 
import express from 'express';
import * as main from '../controllers/mainController';
import {body} from 'express-validator/check'; 
const mainRouter = express.Router();  

export function mrouter() {
  mainRouter.route('/')
    .get(main.getIndex) 
    .post([
      body('message', 'Empty Message Field').not().isEmpty().trim(), 
      body('fullname', 'Empty Name Field').not().isEmpty().trim(),
      body('email', 'Invalid Email').isEmail().normalizeEmail()
      ], main.postIndex);
  mainRouter.route('/profile/:username')
      .get(main.getProfile);   
  mainRouter.route('/editprofile')
      .get(main.editProfile)
      .post([ 
        body('weaknessOther').trim(),
        body('strengthOther').trim(),
        body('allergyOther').trim(),
        body('qualmOther').trim(),
        body('spiritOther').trim()], main.postProfile); 
  mainRouter.route('/directory')
      .get(main.getDirectory); 
  mainRouter.route('/chat')
      .get(main.getMessages); 
  return mainRouter; 
}


