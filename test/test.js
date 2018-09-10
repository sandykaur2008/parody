'use strict';

var server = require('../server-dest/server.js'), 
    expect = require('chai').expect,
    request = require('request'); 

describe('server response', function () {

  it('should return 404', function(done) {
    request.get('http://localhost:8080/fake', function (err, res){
      expect(res.statusCode).to.equal(404);
      done();
    }); 
  }); 

  it('should return 200', function(done) {
    request.get('http://localhost:8080', function (err, res){
      expect(res.statusCode).to.equal(200);
      done();
    });
  });
}); 

describe('utilities functionality', function () {

  after(function () {
    server.close();
   });

  it('should return body of request', function(done) {
    request.get('http://localhost:8080', function (err, res){
      expect(res.body).to.include('Welcome');
      done();
    });
  });

  it('should return headers of request', function(done) {
    request.get('http://localhost:8080', function (err, res){
      expect(res.headers).to.include({ 'content-type': 'text/html' });
      done();
    });
  });
});