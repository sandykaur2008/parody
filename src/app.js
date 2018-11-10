'use strict';   
import express from 'express';
const app = express(); 
import bodyParser from 'body-parser'; 
import csrf from 'csurf'; 
import multer from 'multer'; 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now());
  } 
  }); 
import session from 'express-session';
import flash from 'connect-flash'; 
import dotenv from 'dotenv';
import helmet from 'helmet'; 
import cookieParser from 'cookie-parser'; 
import {mrouter} from './routes/mainRoutes'; 
const mainRouter = mrouter(); 
import {arouter} from './routes/authRoutes';  
const authRouter = arouter(); 

dotenv.config();  
const env = process.env.NODE_ENV; 
const envString = env.toUpperCase(); 
const port = process.env['PORT_' + envString]; 
app.use(bodyParser.urlencoded({extended: true})); 
app.use(bodyParser.json()); 
app.use(cookieParser()); 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
})); 

app.use(multer({storage: storage}).single('avatar')); 
app.use(
  envString === 'TEST' ?
  csrf({ ignoreMethods: ['GET', 'POST']}): 
  csrf()
); 
import {passportConfig} from './config/passport.js';
passportConfig(app);  
app.use(flash()); 
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.usersOnline = require('./config/socket').usersOnline || null; 
  let token = req.csrfToken();
  res.cookie('XSRF-TOKEN', token);
  res.locals.csrftoken  = token; 
  next();
});
app.use(helmet()); 
app.use(express.static('public')); 
app.use('/', mainRouter); 
app.use('/auth', authRouter); 
app.set('views', './dest/views'); 
app.set('view engine', 'ejs'); 
app.use(function (req, res, next) {
  res.status(404).render('404', {title: '404'}); 
}); 
app.use(function (req, res, next) {
  res.status(500).render('500', {title: '500'}); 
}); 

export const server = app.listen(port, function(){
  console.log('listening on port ' + `${port}`); 
}); 

const io = require('./config/socket').listen(server); 

