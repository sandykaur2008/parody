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

function checkProperty(property, array) { 
  for (let i = 0; i < property.length; i++) { 
    var checked = property[i][1]; 
    if (checked === '1' ) {
      array.push("checked");  
    } else {
      array.push("");  
    }
  }
  return array; 
}

export async function editProfile({username}) {
  const weaknessArray = []; 
  const strengthArray = [];
  const qualmArray = [];
  const spiritArray = [];
  const allergyArray = []; 

  try {
    const db = await getDB();  
    const col = db.collection('users'); 
    const dbUser= await col.findOne({username: username});
    const updatedweaknessArray = checkProperty(dbUser.weakness, weaknessArray); 
    const updatedstrengthArray = checkProperty(dbUser.strength, strengthArray); 
    const updatedqualmArray = checkProperty(dbUser.qualm, qualmArray);
    const updatedallergyArray = checkProperty(dbUser.allergy, allergyArray);
    const updatedspiritArray = checkProperty(dbUser.spirit, spiritArray); 
    const results = {
      dbUser,
      updatedweaknessArray,
      updatedstrengthArray,
      updatedqualmArray,
      updatedallergyArray,
      updatedspiritArray
    }; 
    return results; 
  } catch (err) {
    console.log(err); 
  }  
}

export function createArray(requestData, requestArray) {
  Object.values(requestData).forEach(value => {
    if (!Array.isArray(value)) {
      requestArray.push(Array.from([value, null])); 
    } else { requestArray.push(value); }
    }); 
    return requestArray; 
}

export async function postProfile({weakness, weaknessOther, strength, strengthOther, 
  allergy, allergyOther, qualm, qualmOther, spirit, spiritOther}, {username}, file) {
    const weaknessArray = []; 
    const strengthArray = [];
    const qualmArray = [];
    const spiritArray = [];
    const allergyArray = []; 
    createArray(weakness, weaknessArray);
    createArray(strength, strengthArray);
    createArray(allergy, allergyArray);
    createArray(qualm, qualmArray);
    createArray(spirit, spiritArray);
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
    