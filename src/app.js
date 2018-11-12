'use strict';   
import dotenv from 'dotenv';
dotenv.config(); 
const env = process.env.NODE_ENV; 
if (env === "TEST") {
  dotenv.config({ path:"/Users/sandykaur/Documents/developing/projects/parody/.env.test"}); 
} else if (env === "DEVELOPMENT"){
  dotenv.config({path: "/Users/sandykaur/Documents/developing/projects/parody/.env.dev"}); 
} 
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
import helmet from 'helmet'; 
import cookieParser from 'cookie-parser'; 
import {mrouter} from './routes/mainRoutes'; 
const mainRouter = mrouter(); 
import {arouter} from './routes/authRoutes';  
const authRouter = arouter(); 
const port = process.env.PORT; 
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
  env === 'TEST' ?
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

