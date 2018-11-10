'use strict'; 
import getDB from '../config/db'; 
import nodemailer from 'nodemailer'; 
import dotenv from 'dotenv';
dotenv.config();  
const env = process.env.NODE_ENV; 
const envString = env.toUpperCase(); 

export const smtpTrans = nodemailer.createTransport({
  host: process.env['MAIL_SERVER_' + envString],  
  port: process.env['MAIL_PORT_' + envString],
  //secure: process.env['SECURE_' + envString],
  auth: {
    user: process.env['MAIL_USERNAME_' + envString],
    pass: process.env['MAIL_PASSWORD_' + envString]
  }
});

export async function renderProfile({username}) {
  try {
    const db = await getDB(); 
    const col = db.collection('users'); 
    const dbUser= await col.findOne({username: username});
    if (dbUser === null) {
      return null; 
    }  
    else {
      return dbUser; 
    } 
  } catch (err) {
    console.log(err); 
  }
} 

export async function postProfile({weakness, weaknessOther, strength, strengthOther, 
  allergy, allergyOther, qualm, qualmOther, spirit, spiritOther}, {username}, file) {
    try {
      const db = await getDB(); 
      const col = db.collection('users'); 
      const userExists = await col.findOne({username: username}); 
      const imagePath = (file !== undefined) ? "/images/uploads/" + file.filename : userExists.imagePath; 
      if (userExists === null) {
        return null; 
      } 
        else {
          await col.updateOne(
            { username: username },
            {
              $set: { 
              imagePath: imagePath,  
              weakness: weakness,
              weaknessOther: weaknessOther,
              strength: strength,
              strengthOther: strengthOther,
              allergy: allergy,
              allergyOther: allergyOther,
              qualm: qualm,
              qualmOther: qualmOther,
              spirit: spirit,
              spiritOther: spiritOther
          }
            }
          );
        }
      return username; 
    } catch (err) {
      console.log(err); 
    }
    }  

function escapeRegex(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }; 

export async function getDirectory({search}) {
      try {
        const db = await getDB(); 
        const col = db.collection('users'); 
        var users = await col.find({}); 
        var usersArray = await users.toArray(); 
        if (search) {
              const regex = new RegExp(escapeRegex(search), 'gi');
              var users = await col.find({username: regex});
              var usersArray = await users.toArray(); 
              return usersArray; 
            } else {
              return usersArray;  
            };  
          } 
     catch (err) {
        console.log(err); 
      }
    } 
    