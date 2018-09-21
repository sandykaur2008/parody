'use strict';
var server = require('../app'), 
    expect = require('chai').expect,
    request = require('request'), 
    nodemailer = require('nodemailer'),
    mockTransport = require('nodemailer-mock-transport'),
    superTest = require('supertest'); 

describe('server response', function () {

  it('should return 404', function(done) {
    request.get('http://localhost:3002/fake', function (err, res){
      if (err) {
        console.log(err); 
      }
      expect(res.statusCode).to.equal(404);
      done();
    }); 
  }); 

  it('should return 200', function(done) {
    request.get('http://localhost:3002', function (err, res){
      if (err) {
        console.log(err); 
      }
      expect(res.statusCode).to.equal(200);
      done();
    });
  });

  it('should return 302', function(done) {
    request.post({
      url: 'http://localhost:3002',
      form: { message: "hello", fullname: "sandy kay", email: "sk595@georgetown.com" }}, function (err, res) {
        if (err) {
          console.log(err); 
        }
        expect(res.statusCode).to.equal(302);
        done();
    }); 
  });
}); 

describe('response contents', function () {

  it('should check body of request', function(done) {
    request.get('http://localhost:3002', function (err, res){
      if (err) {
        console.log(err); 
      }
      expect(res.body).to.include('Welcome');
      done();
    });
  });

  it('should check headers of request', function(done) {
    request.get('http://localhost:3002', function (err, res){
      if (err) {
        console.log(err); 
      }
      expect(res.headers).to.include({ 'content-type': 'text/html; charset=utf-8' });
      done();
    });
  });
});

describe('email functionality', function () {

  it('should check email message', function () {
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

describe('check validation (invalid entries)', function () {

  it('contact form should be invalid', function(done) {
    request.post({
      url: 'http://localhost:3002',
      form: { message: "hello", fullname: "sandy kay", email: "sk595" }}, function (err, res) {
        if (err) {
          console.log(err); 
        }
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.include('Invalid Email'); 
        done(); 
    });
  }); 

  it('registration form should be invalid due to mismatching passwords', function(done) {
    request.post({
    url: 'http://localhost:3002/auth/register',
    form: { username: "jack", password: "12345", password2: "123456"}}, function (err, res) {
      if (err) {
        console.log(err);
      }
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.include('Passwords do not match'); 
      done(); 
    }); 
  }); 

  it('registration form should be invalid due to already taken username', function(done) {
    request.post({
    url: 'http://localhost:3002/auth/register',
    form: { username: "jack", password: "12345", password2: "12345"}}, function (err, res) {
      if (err) {
        console.log(err);
      }
      expect(res.statusCode).to.equal(200);
      expect(res.body).to.include('Username already taken'); 
      done(); 
    }); 
  }); 

  it('login form should be invalid and redirect', function(done) {
    request.post({
    url: 'http://localhost:3002/auth/login',
    form: { username: "sandykaur200", password: "history2012"}}, function (err, res) {
      if (err) {
        console.log(err);
      }
      expect(res.statusCode).to.equal(302); 
      expect(res.body).to.include('Redirecting to /auth/login');
      done(); 
    }); 
  }); 
}); 

describe('check validation (valid entries)', function () {

  after(function () {
    server.close();
   });

  it('should login/logout user', function (done) {
    request.post({
      url: 'http://localhost:3002/auth/login',
      form: {username: "sandykaur2008", password: "history2012"}}, function (err, res){
        if (err) {
          console.log(err); 
        }
        expect(res.statusCode).to.equal(302);
        expect(res.body).to.include('Redirecting to /auth/profile');
        done(); 
    }); 
  }); 
}); 
  

