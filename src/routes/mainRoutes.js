const express = require('express');
const router = express.Router(); 
const nodemailer = require('nodemailer'); 

router.get('/', (req, res) => {
  res.render('index', {
    title: 'Home',
    messages: req.flash('msg')
  }); 
}); 

router.post('/', (req, res) => {
  let smtpTrans = nodemailer.createTransport({
    host: process.env.MAIL_SERVER, 
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD
    }
  });
  let mailOpts = {
    from: req.body.fullname + ' &lt;' + req.body.email + '&gt;',
    to: process.env.MAIL_USERNAME,
    subject: 'Parody site message!',
    text: `${req.body.fullname} (${req.body.email}) says: ${req.body.message}`
  }; 
  smtpTrans.sendMail(mailOpts, (error, info) => {
    if (error) {
      req.flash('msg', 'Error Occured');
      res.redirect('/');
    }
    req.flash('msg', 'Thanks for your email!'); 
    res.redirect('/'); 
  }); 
}); 

module.exports = router; 
