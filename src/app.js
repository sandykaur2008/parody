'use strict'; 
const express = require('express');
const app = express(); 
const bodyParser = require('body-parser'); 
const csrf = require('csurf'); 
const multer = require('multer'); 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now());
  } 
  }); 
const session = require('express-session');
const flash= require('connect-flash'); 
const dotenv = require('dotenv');
const passport = require('passport'); 
const debug = require('debug')('app'); 
const helmet = require('helmet'); 
const cookieParser = require('cookie-parser'); 
const path = require('path'); 
const mainRouter = require('./routes/mainRoutes')(); 
const authRouter = require('./routes/authRoutes')();  

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
require('./config/passport.js')(app); 
app.use(flash()); 
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  var token = req.csrfToken();
  res.cookie('XSRF-TOKEN', token);
  res.locals.csrftoken  = token; 
  console.log("csrf token = " + token); 
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



const server = app.listen(port, function(){
  console.log('listening on port ' + `${port}`); 
}); 

module.exports = server; 