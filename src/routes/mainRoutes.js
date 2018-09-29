'use strict'; 
const express = require('express');
const mainController = require('../controllers/mainController');
const { body } = require('express-validator/check'); 
const mainRouter = express.Router();  



function router() {
  const { getIndex, postIndex, getProfile, editProfile, postProfile} = mainController(); 
  mainRouter.route('/')
    .get(getIndex) 
    .post([
      body('message', 'Empty Message Field').not().isEmpty().trim().escape(), 
      body('fullname', 'Empty Name Field').not().isEmpty().trim().escape(),
      body('email', 'Invalid Email').isEmail().normalizeEmail()
      ], postIndex);
  mainRouter.route('/profile')
      .get(getProfile);   
  mainRouter.route('/editprofile')
      .get(editProfile)
      .post(postProfile); 
  return mainRouter; 
}


module.exports = router; 
