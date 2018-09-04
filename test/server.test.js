var server = require('../server-dest/server.js'); 
    expect = require('chai').expect,
    request = require('request'), 

describe('server response', function () {

  after(function () {
   server.close();
  });

  it('should return 404', function(done) {
    request.get('http://localhost:8080/fake', function (err, res, body){
      expect(res.statusCode).to.equal(404);
      done();
    }); 
  }); 
}); 