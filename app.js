'use strict'; 
const express = require('express');
const app = express(); 
const bodyParser = require('body-parser'); 
const session = require('express-session');
const flash= require('connect-flash'); 
const dotenv = require('dotenv');
const passport = require('passport'); 
const debug = require('debug')('app'); 
const cookieParser = require('cookie-parser'); 
const mainRouter = require('./src/routes/mainRoutes')(); 
const authRouter = require('./src/routes/authRoutes')();  

dotenv.config();  
const env = process.env.NODE_ENV; 
const envString = env.toUpperCase(); 
const port = process.env['PORT_' + envString]; 

app.use(bodyParser.urlencoded({extended: true})); 
app.use(bodyParser.json()); 
app.use(cookieParser()); 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
})); 
require('./src/config/passport.js')(app); 
app.use(flash()); 
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});
app.use('/', mainRouter); 
app.use('/auth', authRouter); 
app.set('views', './src/views'); 
app.set('view engine', 'ejs'); 


const server = app.listen(port, function(){
  console.log('listening on port ' + `${port}`); 
}); 

module.exports = server; 