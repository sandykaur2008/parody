'use strict';
var server = require('../app'), 
    expect = require('chai').expect,
    request = require('request'), 
    nodemailer = require('nodemailer'),
    mockTransport = require('nodemailer-mock-transport');

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

describe('check form validation', function () {

  after(function () {
    server.close();
   });

  it('should validate contact form', function(done) {
    request.post({
      url: 'http://localhost:3002',
      form: { message: "hello", fullname: "sandy kay", email: "sk595" }}, function (err, res) {
        if (err) {
          console.log(err); 
        }
        expect(res.statusCode).to.equal(200);
        expect(res.body).include('Invalid Email'); 
        done();
    });
  }); 
});  