const express = require('express');
const app = express(); 

app.set('views', './src/views'); 
app.set('view engine', 'ejs'); 

const mainRouter = require('./src/routes/mainRoutes'); 
const authRouter = require('./src/routes/authRoutes'); 

app.use('/', mainRouter); 

app.listen(4000, function(){
  console.log('listening on port 4000'); 
}); 