'use strict'; 
import getDB from './db'; 
import bcrypt from 'bcrypt'; 
import crypto from 'crypto'; 

export async function addUser({ username, password, email }) {
  try {
    const db = await getDB(); 
    const col = db.collection('users'); 
    const hashedPassword = await bcrypt.hash(password, 10); 
    const user =  { 
      imagePath: '/images/uploads/default.png',
      username: username, 
      password: hashedPassword,
      email: email
    }; 
    const exists = await col.findOne({$or: [
      {username: username},
      {email: email }
    ]}); 
    if (exists === null) {
      const results = await col.insertOne(user);
      return results;
    }
  } catch (err) {
      console.log(err); 
    }
}

export async function sendReset({email}, {host}) {
  try {
    const db = await getDB()
    const col = db.collection('users'); 
    const user = await col.findOne({ email: email }); 
    if (user === null) {
      return null; 
      } else {
        const token = crypto.randomBytes(20).toString('hex'); 
        await col.updateOne(
          { email: user.email },
          {
            $set: {resetToken: token, expires: Date.now() + 300000}
          }
        );

        const mailOpts = {
          from: "parody@reset.com", 
          to: user.email,
          subject: 'Parody site reset!',
          text: 'You are receiving this because you have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + host + '/auth/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        }; 
        return mailOpts; 
      } 
  } catch (err) {
    console.log(err); 
    }
  }  

export async function reset({token}) {
  try {
    const db = await getDB(); 
    const col = db.collection('users'); 
    const user = await col.findOne({ resetToken: token,
    expires: { $gt: Date.now() }  }); 
    if (user === null) {
      return null 
      } else {
        return user.resetToken; 
      } 
  } catch (err) {
    console.log(err); 
    }
} 

export async function doReset({password}, {token}) {
  try {
    const db = await getDB() 
    const col = db.collection('users'); 
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await col.findOne({ resetToken: token,
    expires: { $gt: Date.now() }  }); 
    if (user === null) {
      return null;
    } else {
        const updatedToken = undefined; 
        await col.updateOne(
          { username: user.username },
          {
            $set: {password: hashedPassword, resetToken: updatedToken, expires: undefined}
          }
        );
        const mailOpts = {
              from: "parody@reset.com", 
              to: user.email,
              subject: 'Parody site reset!',
              text: 'This is confirmation that your password has been reset'
            }; 
        return mailOpts;  
      } 
  } catch (err) {
      console.log(err); 
    }
} 