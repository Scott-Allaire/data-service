var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;

chai.use(chaiHttp);

it('get a collection', function (done) {
    chai.request('http://localhost:8080')
        .get("/data/test")
        .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            done();
        });
});

it('send a document', function (done) {
    chai.request('http://localhost:8080')
        .post("/data/test")
        .set('content-type', 'application/json')
        .send({myparam: 'test'})
        .end(function (err, res) {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            done();
        });
});