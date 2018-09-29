'use strict';
const server = require('../dest/app'), 
    expect = require('chai').expect,
    request = require('request'), 
    nodemailer = require('nodemailer'),
    { MongoClient } = require('mongodb'), 
    mockTransport = require('nodemailer-mock-transport'); 
    const url = 'mongodb://localhost:27017'; 
    const dbName = 'parodyTest';

describe('server response', () => {

  it('should return 404', (done) => {
    request.get('http://localhost:3002/fake', (err, res) => {
      if (err) {
        console.log(err); 
      }
      expect(res.statusCode).to.equal(404);
      done();
    }); 
  }); 

  it('should return 200', (done) => {
    request.get('http://localhost:3002', (err, res) => {
      if (err) {
        console.log(err); 
      }
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('should return 302', (done) => {
    request.post({
      url: 'http://localhost:3002',
      form: { message: "hello", fullname: "sandy kay", email: "sk595@georgetown.com" }}, (err, res) => {
        if (err) {
          console.log(err); 
        }
        expect(res.statusCode).to.equal(302);
        done();
    }); 
  });
}); 

describe('response contents', () => {

  it('should check body of request', (done) => {
    request.get('http://localhost:3002', (err, res) => {
      if (err) {
        console.log(err); 
      }
      expect(res.body).to.include('Welcome');
      done();
    });
  });

  it('should check headers of request', (done) => {
    request.get('http://localhost:3002', (err, res) => {
      if (err) {
        console.log(err); 
      }
      expect(res.headers).to.include({ 'content-type': 'text/html; charset=utf-8' });
      done();
    });
  });
});

describe('email functionality', () => {

  it('should check email message', () => {
    var transport = mockTransport({
      foo: 'bar'
    });

    var transporter = nodemailer.createTransport(transport);

    transporter.sendMail({
      from: 'server@address.com',
      to: 'receiver@address.com',
      subject: 'hello',
      text: 'hello world!'
    }); 

    expect(transport.sentMail.length).to.equal(1); 
    expect(transport.sentMail[0].data.from).to.equal('server@address.com');
  });
})

describe('check validation (invalid entries)', () => {

  it('contact form should be invalid', (done) => {
    request.post({
      url: 'http://localhost:3002',
      form: { message: "hello", fullname: "sandy kay", email: "sk595" }}, (err, res) => {
        if (err) {
          console.log(err); 
        }
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.include('Invalid Email'); 
        done(); 
    });
  }); 

  it('registration form should be invalid due to mismatching passwords', (done) => {
    request.post({
    url: 'http://localhost:3002/auth/register',
    form: { username: "example", email: "example@example.com", password: "12345", password2: "123456"}}, (err, res) => {
      if (err) {
        console.log(err);
      }
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.include('Passwords do not match'); 
      done(); 
    }); 
  }); 

  it('registration form should be invalid due to already taken username', (done) => {
    request.post({
    url: 'http://localhost:3002/auth/register',
    form: { username: "mark", email: "example@example.com", password: "hello", password2: "hello"}}, (err, res) => {
      if (err) {
        console.log(err);
      }
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.include('Username/email already registered'); 
      done(); 
    }); 
  }); 

  it('login form should be invalid and redirect', (done) => {
    request.post({
    url: 'http://localhost:3002/auth/login',
    form: { username: "sandykaur200", password: "history2012"}}, (err, res) => {
      if (err) {
        console.log(err);
      }
      expect(res.statusCode).to.equal(302); 
      expect(res.body).to.include('Redirecting to /auth/login');
      done(); 
    }); 
  }); 
}); 

describe('check validation (valid entries)', () => {
  after( () => {
    server.close();
   });

  it('should login user', (done) => {
    request.post({
      url: 'http://localhost:3002/auth/login',
      form: {username: "sandykaur2008", password: "hello"}}, (err, res) => {
        if (err) {
          console.log(err); 
        }
        expect(res.statusCode).to.equal(302);
        expect(res.body).to.include('Redirecting to /profile/');
        done(); 
    }); 
  }); 

  it('should send reset password email', (done) => {
    request.post({
      url: 'http://localhost:3002/auth/forgot',
      form: { email: "test@example.com" }}, (err, res) => {
        if (err) {
          console.log(err); 
        }
        expect(res.statusCode).to.equal(302);
        done(); 
    });
  });
  it ('should reset password via email link', (done) => {
    async function findUser() {
        var client = await MongoClient.connect(url); 
        const db = client.db(dbName); 
        const col = db.collection('users'); 
        const user = await col.findOne({email: "test@example.com"});          
        return user.resetToken; 
        } 
    findUser().then((token) => {
      request.post({
        url: 'http://localhost:3002/auth/reset/' + token,
         form: { password: "hello", password2: "hello"}}, (err, res) => {
           if (err) {
             console.log(err); 
           }
           expect(res.statusCode).to.equal(302);
           console.log(res.body); 
           expect(res.body).to.include("Redirecting to /");
           done();   
        }); 
      });
  }); 
}); 

describe('check profile rendering & editing', () => {

  it('should check body of profile', (done) => {
    expect(res.body).to.include("Redirecting to /profile/"); 
  }); 
}); 