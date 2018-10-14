'use strict';
const { validationResult } = require('express-validator/check'); 
const { MongoClient } = require('mongodb'); 
const nodemailer = require('nodemailer'); 
const dotenv = require('dotenv');
dotenv.config();  
const env = process.env.NODE_ENV; 
const envString = env.toUpperCase(); 
const url = 'mongodb://localhost:27017'; 
if (envString === 'TEST') {
  var dbName = 'parodyTest';
} 
else {
  var dbName = 'parodyApp';
}

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
      (async function renderProfile() {
        let client;
        try {
          client = await MongoClient.connect(url); 
          const db = client.db(dbName); 
          const col = db.collection('users'); 
          const username = req.params.username; 
          const dbUser= await col.findOne({username: username});
          if (dbUser === null) {
            return res.render('404', {title: '404'}); 
        } 
          else {
          res.render('profile', {
              title: 'Profile',  
              relevantUser: dbUser, 
              image: dbUser.imagePath, 
              weakness: dbUser.weakness,
              strength: dbUser.strength,
              allergy: dbUser.allergy,
              spirit: dbUser.spirit,
              qualm: dbUser.qualm,
              weaknessOther: dbUser.weaknessOther,
              strengthOther: dbUser.strengthOther,
              qualmOther: dbUser.qualmOther,
              allergyOther: dbUser.allergyOther,
              spiritOther: dbUser.spiritOther 
            }); 
          } 
        } catch (err) {
          console.log(err); 
        }
        }()); 
    } 
    else {
      res.render('index', {
        title: 'index',
        messages: 'You must register/login to access profile page',
        errors: [] 
      });
    }
}

  function editProfile(req, res) {
    const weaknessArray = []; 
    const strengthArray = [];
    const qualmArray = [];
    const spiritArray = [];
    const allergyArray = []; 
    
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
            res.render('index', {
              title: 'index',
              messages: 'You must register/login to access profile page',
              errors: [] 
            }); 
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
              image: dbUser.imagePath, 
              weaknessArray: updatedweaknessArray,
              weaknessOther: dbUser.weaknessOther,
              strengthArray: updatedstrengthArray,
              strengthOther: dbUser.strengthOther,
              qualmArray: updatedqualmArray,
              qualmOther: dbUser.qualmOther,
              allergyArray: updatedallergyArray,
              allergyOther: dbUser.allergyOther,
              spiritArray: updatedspiritArray, 
              spiritOther: dbUser.spiritOther 
            }); 
          }
      } catch (err) {
        console.log(err); 
      }
      }());  
  }

  function postProfile(req, res) {
    const weakness = req.body.weakness;
    const weaknessOther = req.body.weaknessOther; 
    const weaknessArray = [];
    const strength = req.body.strength; 
    const strengthOther = req.body.strengthOther; 
    const strengthArray = []; 
    const allergy = req.body.allergy; 
    const allergyOther = req.body.allergyOther; 
    const allergyArray = []; 
    const qualm = req.body.qualm; 
    const qualmOther = req.body.qualmOther; 
    const qualmArray = []; 
    const spirit = req.body.spirit; 
    const spiritOther = req.body.spiritOther; 
    const spiritArray = [];
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
        if (req.file === undefined) {
          var imagePath = userExists.imagePath; 
        } else { 
          var imagePath = "/images/uploads/" + req.file.filename;
         }
        if (userExists === null) {
            res.render('register', {
              title: 'Register',
              errors: [{msg: 'Username not registered'}]});
        } 
          else {
            await col.updateOne(
              { username: user.username },
              {
                $set: { 
                imagePath: imagePath,  
                weakness: weaknessArray,
                weaknessOther: weaknessOther,
                strength: strengthArray,
                strengthOther: strengthOther,
                allergy: allergyArray,
                allergyOther: allergyOther,
                qualm: qualmArray,
                qualmOther: qualmOther,
                spirit: spiritArray,
                spiritOther: spiritOther
            }
              }
            );
            return res.redirect('/profile/'+ user.username); 
          }
      } catch (err) {
        console.log(err); 
      }
      }());   
  }
  
  function getDirectory(req, res) {
    (async function getDirectory() {
      let client;
      try {
        client = await MongoClient.connect(url); 
        const db = client.db(dbName); 
        const col = db.collection('users'); 
        var users = await col.find({}); 
        var usersArray = await users.toArray(); 

        if (!req.user) {
            res.render('index', {
              title: 'index',
              messages: 'You must register/login to access directory',
              errors: [] 
            }); 
        } 
          else {
            if (req.query.search) {
              const regex = new RegExp(escapeRegex(req.query.search), 'gi');
              var users = await col.find({username: regex});
              var usersArray = await users.toArray(); 
              return res.render('directory', {
                title: "Directory",
                users: usersArray
              }); 
            } else {
              return res.render('directory', {
                title: "Directory",
                users: usersArray
              }); 
            };  
          } 
      } catch (err) {
        console.log(err); 
      }
      }());   
  } 

  function getMessages(req, res) {
    if (!req.user) {
      res.render('index', {
        title: 'index',
        messages: 'You must register/login to access messages',
        errors: [] 
      }); 
  } else {
    (async function getUsers() {
      let client;
      try {
        client = await MongoClient.connect(url); 
        const db = client.db(dbName); 
        const col = db.collection('users'); 
        var users = await col.find({}); 
        var usersArray = await users.toArray();  
        res.render('chat', {
          title: 'Chat',
          users: usersArray
        }); 
      } catch (err) {
        console.log(err); 
        }
      }());   
    }  
  }
  
  return {
    getIndex,
    postIndex,
    getProfile,
    editProfile,
    postProfile,
    getDirectory,
    getMessages
  }; 
}

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}; 

module.exports = mainController; 