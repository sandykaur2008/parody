'use strict'; 
const express = require('express');
const app = express(); 
const bodyParser = require('body-parser'); 
const mainRouter = require('./src/routes/mainRoutes'); 
const authRouter = require('./src/routes/authRoutes');  
const session = require('express-session');
const flash= require('connect-flash'); 
const dotenv = require('dotenv');

dotenv.config();  
const env = process.env.NODE_ENV; 
const envString = env.toUpperCase(); 
const port = process.env['PORT_' + envString]; 

app.set('views', './src/views'); 
app.set('view engine', 'ejs'); 
app.use(bodyParser.urlencoded({extended: true})); 
app.use(bodyParser.json()); 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
})); 
app.use(flash()); 
app.use('/', mainRouter); 
app.use('/auth', authRouter); 


const server = app.listen(port, function(){
  console.log('listening on port ' + `${port}`); 
}); 

module.exports = server; 