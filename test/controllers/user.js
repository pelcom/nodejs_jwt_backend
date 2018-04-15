var chai = require('chai');
var expect = chai.expect;
var request = require('supertest');
var app = require('../../server.js');

describe('POST /login', function () {
	it('it responds with JSON for all post request to /login route', function (done) {
		request(app)
			.post('/login')
			.type('json')
			.send('{"username":"ba","password":"wrongfg"}')
			.expect('Content-Type', /json/)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});

	it('there is a boolean key "success" to show outcome on all authentication attempts', function (done) {
		request(app)
			.post('/login')
			.type('json')
			//.send('{"username":"ba","password":"wrongfg"}')
			.expect('Content-Type', /json/)
			.end(function (err, res) {
				if (err) return done(err);
				expect(res.body).have.property('success');
				expect(typeof res.body.success).to.equal('boolean');
				done();
			});
	});

	it('there is a string key "message" to shed ligth on outcome of any authentication attempts', function (done) {
		request(app)
			.post('/login')
			.type('json')
			//.send('{"username":"ba","password":"wrongfg"}')
			.expect('Content-Type', /json/)
			.end(function (err, res) {
				if (err) return done(err);
				expect(res.body).have.property('message');
				expect(typeof res.body.message).to.equal('string');
				done();
			});
	});

	it('it responds with 401 status code if username is less than 3 characters', function (done) {
		request(app)
			.post('/login')
			.type('json')
			.send('{"username":"ba","password":"wrongfg"}')
			.expect(401)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});

	it('it responds with 401 status code if username is not set', function (done) {
		request(app)
			.post('/login')
			.type('json')
			.send('{"password":"wrongfg"}')
			.expect(401)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});
	it('it responds with 401 status code if username is not a string', function (done) {
		request(app)
			.post('/login')
			.type('json')
			.send('{"username":{},"password":"wrongfg"}')
			.expect(401)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});


	it('it responds with 401 status code if password is less than 6 characters', function (done) {
		request(app)
			.post('/login')
			.type('json')
			.send('{"username":"bade","password":"wrong"}')
			.expect(401)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});

	it('it responds with 200 status code if good username or password', function (done) {
		request(app)
			.post('/login')
			.type('json')
			.send('{"username":"gooduser","password":"longpassword"}')
			.expect(200)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});

	it('it returns JWT token if good username or password', function (done) {
		request(app)
			.post('/login')
			.type('json')
			.send('{"username":"gooduser","password":"longpassword"}')
			.end(function (err, res) {
				if (err) return done(err);

				expect(res.body).have.property('jwt');

				done();
			});
	});
});
