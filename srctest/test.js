'use strict';

import {server} from '../dest/app'; 
import getDB from '../dest/config/db';  
import {expect} from 'chai'; 
import request from 'request'; 
import nodemailer from 'nodemailer'; 
import mockTransport from 'nodemailer-mock-transport'; 
import supertest from 'supertest'; 
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
    form: { username: "test", email: "example@example.com", password: "hello", password2: "hello"}}, (err, res) => {
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
    form: { username: "tes", password: "history2012"}}, (err, res) => {
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

  it('should login user', (done) => {
    request.post({
      url: 'http://localhost:3002/auth/login',
      form: {username: "test", password: "hello"}}, (err, res) => {
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
        const db = await getDB(dbName); 
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

describe('check profile/directory/chat rendering & editing', () => {

  const user = {
    username: "test",
    password: "hello"
  }; 

  var authenticatedUser = supertest.agent(server); 

  before ((done) => {
    authenticatedUser
      .post('/auth/login')
      .send(user)
      .end( (err, res) => {
        expect(res.statusCode).to.equal(302);
        expect(res.text).to.include('Redirecting to /profile/'); 
        done(); 
      }); 
    }); 

  after( () => {
    server.close();
   });

  it('should redirect once update profile I', (done) => {
    const form = {
      weakness: [
        ["0", null],
        ["0", null],
        ["0", null],
        ["0", null],
        ["0", null]
      ], 
      weaknessOther: "test weakness", 
      strength: [
        ["0", null],
        ["0", null],
        ["0", null],
        ["0", null],
        ["0", null]
      ],
      strengthOther: "",
      allergy: [
        ["0", null],
        ["0", null],
        ["0", null],
        ["0", null],
        ["0", null]
      ],
      allergyOther: "",
      qualm: [
        ["0", null],
        ["0", null],
        ["0", null],
        ["0", null],
      ],
      qualmOther: "", 
      spirit: [
        ["0", null],
        ["0", null],
        ["0", null],
      ],
      spiritOther: "",
    }; 
    authenticatedUser
    .post('/editprofile')
    .send(form)
    .end( (err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res.statusCode).to.equal(302);
        done(); 
    });
  });
  it('should confirm updating of profile I', (done) => { 
    authenticatedUser
    .get('/profile/' + user.username)
    .end( (err, res) => {
      if (err) {
        console.log(err);
      }
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('test weakness');
      done(); 
    }); 
  });  

  it('should redirect once update profile II', (done) => {
    const form = {
      weakness: [
        ["0", null],
        ["0", null],
        ["0", null],
        ["0", null],
        ["0", null]
      ], 
      weaknessOther: "", 
      strength: [
        ["0", null],
        ["0", null],
        ["0", null],
        ["0", null],
        ["0", null]
      ],
      strengthOther: "test strength",
      allergy: [
        ["0", null],
        ["0", null],
        ["0", null],
        ["0", null],
        ["0", null]
      ],
      allergyOther: "",
      qualm: [
        ["0", null],
        ["0", null],
        ["0", null],
        ["0", null],
      ],
      qualmOther: "", 
      spirit: [
        ["0", null],
        ["0", null],
        ["0", null],
      ],
      spiritOther: "",
    }; 
    authenticatedUser
    .post('/editprofile')
    .send(form)
    .end( (err, res) => {
        if (err) {
          console.log(err);
        }
        expect(res.statusCode).to.equal(302);
        done(); 
    });
  });
  it('should confirm updating of profile II', (done) => { 
    authenticatedUser
    .get('/profile/' + user.username)
    .end( (err, res) => {
      if (err) {
        console.log(err);
      }
      expect(res.statusCode).to.equal(200);
      expect(res.text).to.include('test strength');
      done(); 
    }); 
  });  
  it ('should search directory', (done) => {
    authenticatedUser
    .get('/directory/?search=hello')
    .end( (err, res) => {
      expect(res.text).to.not.include('test2'); 
      done(); 
    }); 
  }); 
  it ('chat should only show users logged in', (done) => {
    authenticatedUser
    .get('/chat')
    .end((err, res) => {
      expect(res.text).to.include('test');
      expect(res.text).to.not.include('test2'); 
      done(); 
    }); 
  }); 
}); 