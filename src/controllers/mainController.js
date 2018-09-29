'use strict';
const { validationResult } = require('express-validator/check'); 
const { MongoClient } = require('mongodb'); 
const nodemailer = require('nodemailer'); 
const dotenv = require('dotenv');
dotenv.config();  
const env = process.env.NODE_ENV; 
const envString = env.toUpperCase(); 

function mainController() {
  function getIndex(req, res) {
    res.render('index', {
      title: 'Home',
      messages: req.flash('msg'),
      errors: []
    }); 
  }
  function postIndex(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const update = errors.array(); 
      console.log(update); 
      return res.render('index', {
        title: 'Home',
        messages: req.flash('msg'),
        errors: update 
      }); 
    }
    let smtpTrans = nodemailer.createTransport({
      host: process.env['MAIL_SERVER_' + envString],  
      port: process.env['MAIL_PORT_' + envString],
      //secure: process.env['SECURE_' + envString],
      auth: {
        user: process.env['MAIL_USERNAME_' + envString],
        pass: process.env['MAIL_PASSWORD_' + envString]
      }
    });
    let mailOpts = {
      from: req.body.email, 
      to: process.env['MAIL_USERNAME_' + envString],
      subject: 'Parody site message!',
      text: `${req.body.fullname} (${req.body.email}) says: ${req.body.message}`
    }; 
    smtpTrans.sendMail(mailOpts, (error, info) => {
      if (error) {
        req.flash('msg', 'Error Occured');
        console.log(error); 
        return res.redirect('/');
      }
      req.flash('msg', 'Thanks for your email!'); 
      return res.redirect('/'); 
    }); 
  }
  function getProfile(req, res) {
    if (req.user) {
      res.render('profile', {
        title: 'Profile', 
      }); 
    } else {
      res.redirect('/'); 
    }
  }

  function editProfile(req, res) {
    const weaknessArray = []; 
    const strengthArray = [];
    const qualmArray = [];
    const spiritArray = [];
    const allergyArray = []; 
    const url = 'mongodb://localhost:27017'; 
    const dbName = 'parodyApp'; 
    
    function checkProperty(property, array) { 
      for (let i = 0; i < property.length; i++) { 
        var checked = property[i][1]; 
        if (checked === '1' ) {
          array.push("checked");  
        } else {
          array.push("");  
        }
      }
    console.log(array); 
    return array; 
    }

    (async function renderProfile() {
      let client;
      try {
        client = await MongoClient.connect(url); 
        const db = client.db(dbName); 
        const col = db.collection('users'); 
        if (!req.user) {
            res.render('register', {
              title: 'Register',
              errors: [{msg: 'You must register to access profile page'}]});
        } 
          else {
          const username = req.user.username; 
          const dbUser= await col.findOne({username: username});
          const updatedweaknessArray = checkProperty(dbUser.weakness, weaknessArray); 
          const updatedstrengthArray = checkProperty(dbUser.strength, strengthArray); 
          const updatedqualmArray = checkProperty(dbUser.qualm, qualmArray);
          const updatedallergyArray = checkProperty(dbUser.allergy, allergyArray);
          const updatedspiritArray = checkProperty(dbUser.spirit, spiritArray); 
            return res.render('editprofile', {
              title: "Edit Profile",
              weaknessArray: updatedweaknessArray,
              strengthArray: updatedstrengthArray,
              qualmArray: updatedqualmArray,
              allergyArray: updatedallergyArray,
              spiritArray: updatedspiritArray
            }); 
          }
      } catch (err) {
        console.log(err); 
      }
      }());  
  }

  function postProfile(req, res) {
    const weakness = req.body.weakness;
    const weaknessArray = [];
    const strength = req.body.strength; 
    const strengthArray = []; 
    const allergy = req.body.allergy; 
    const allergyArray = []; 
    const qualm = req.body.qualm; 
    const qualmArray = []; 
    const spirit = req.body.spirit; 
    const spiritArray = [];
    const url = 'mongodb://localhost:27017'; 
    const dbName = 'parodyApp'; 
    const user = req.user; 

    function createArray(requestData, requestArray) {
      Object.values(requestData).forEach(value => {
        if (!Array.isArray(value)) {
          requestArray.push(Array.from([value, null])); 
        } else { requestArray.push(value); }
        }); 
        return requestArray; 
    }
    
    createArray(weakness, weaknessArray);
    createArray(strength, strengthArray);
    createArray(allergy, allergyArray);
    createArray(qualm, qualmArray);
    createArray(spirit, spiritArray);

    (async function editProfile() {
      let client;
      try {
        client = await MongoClient.connect(url); 
        const db = client.db(dbName); 
        const col = db.collection('users'); 
        const userExists = await col.findOne({username: user.username}); 
        if (userExists === null) {
            res.render('register', {
              title: 'Register',
              errors: [{msg: 'Username not registered'}]});
        } 
          else {
            await col.updateOne(
              { username: user.username },
              {
                $set: { weakness: weaknessArray,
                strength: strengthArray,
                allergy: allergyArray,
                qualm: qualmArray,
                spirit: spiritArray
            }
              }
            );
            return res.redirect('/profile'); 
          }
      } catch (err) {
        console.log(err); 
      }
      }());   
  }
  return {
    getIndex,
    postIndex,
    getProfile,
    editProfile,
    postProfile
  }; 
}

module.exports = mainController; 