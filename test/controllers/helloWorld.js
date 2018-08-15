var request = require('supertest');
var chai = require('chai');
var expect = chai.expect;
var app = require('../../server.js');
var jwt = require('jsonwebtoken');
const sizeOf = require('image-size');

var winston = require('winston');
var config = require('../../config.js');

describe('POST /apply_json_patch', function () {
	it('it responds with 401 status code if no authorization header', function (done) {
		request(app).post('/api/apply_json_patch').expect(401).end(function (err, res) {
			if (err) return done(err);
			done();
		});
	});

	it('it responds with JSON if no authorization header', function (done) {
		request(app).post('/api/apply_json_patch').expect('Content-Type', /json/).end(function (err, res) {
			if (err) return done(err);
			done();
		});
	});

	it('it responds with 200 status code if good authorization header', function (done) {
		var token = jwt.sign({
			id: 1,
		}, config.JWT_SECRET, {
			expiresIn: 60 * 60 * 24 * 365
		});
		request(app)
			.post('/api/apply_json_patch')
			.set('Authorization', token)
			.expect(200)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});

	it('it responds with JSON if good authorization header', function (done) {
		var token = jwt.sign({
			id: 1,
		}, config.JWT_SECRET, {
			expiresIn: 60 * 60 * 24 * 365
		});
		request(app)
			.post('/api/apply_json_patch')
			.set('Authorization', token)
			.expect('Content-Type', /json/)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});
	it('it responds with success:false if json_patch is not a valid json patch', function (done) {
		var token = jwt.sign({
			id: 1,
		}, config.JWT_SECRET, {
			expiresIn: 60 * 60 * 24 * 365
		});
		request(app)
			.post('/api/apply_json_patch')
			.send({
				json_patch: "",
				json_object_to_patch: {
					firstName: "Albert",
					contactDetails: {
						phoneNumbers: []
					}
				}
			})
			.set('Authorization', token)
			.expect('Content-Type', /json/)
			.end(function (err, res) {
				if (err) return done(err);
				expect(res.body.success).to.equal(false);
				done();
			});
	});
	it('it responds with success:false if json_object_to_patch is not a valid json patch', function (done) {
		var token = jwt.sign({
			id: 1,
		}, config.JWT_SECRET, {
			expiresIn: 60 * 60 * 24 * 365
		});
		request(app)
			.post('/api/apply_json_patch')
			.send({
				json_patch: [
					{
						op: "replace",
						path: "/firstName",
						value: "Joachim"
		},
					{
						op: "add",
						path: "/lastName",
						value: "Wester"
		},
					{
						op: "add",
						path: "/contactDetails/phoneNumbers/0",
						value: {
							number: "555-123"
						}
		}
],
				json_object_to_patch: ""
			})
			.set('Authorization', token)
			.expect('Content-Type', /json/)
			.end(function (err, res) {
				if (err) return done(err);
				expect(res.body.success).to.equal(false);
				done();
			});
	});
	it('it responds with success:true and the patched object as patched_object if both json_patch and json_object_to_patch are currectly set and valid', function (done) {
		var token = jwt.sign({
			id: 1,
		}, config.JWT_SECRET, {
			expiresIn: 60 * 60 * 24 * 365
		});
		request(app)
			.post('/api/apply_json_patch')
			.send({
				json_patch: [
					{
						op: "replace",
						path: "/firstName",
						value: "Joachim"
		},
					{
						op: "add",
						path: "/lastName",
						value: "Wester"
		},
					{
						op: "add",
						path: "/contactDetails/phoneNumbers/0",
						value: {
							number: "555-123"
						}
		}
],
				json_object_to_patch: {
					firstName: "Albert",
					contactDetails: {
						phoneNumbers: []
					}
				}
			})
			.set('Authorization', token)
			.expect('Content-Type', /json/)
			.end(function (err, res) {
				if (err) return done(err);
				expect(res.body.success).to.equal(true);
				done();
			});
	});
});

describe('GET /create_thumbmail', function () {
	this.timeout(150000);
	it('it responds with 401 status code if no authorization header', function (done) {
		request(app)
			.get('/api/create_thumbmail')
			.expect(401)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});

	it('it responds with 200 status code if good authorization header', function (done) {
		var token = jwt.sign({
			id: 1,
		}, config.JWT_SECRET, {
			expiresIn: 60 * 60 * 24 * 365
		});
		request(app)
			.get('/api/create_thumbmail')
			.set('Authorization', token)
			.expect(200)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});


	it('it responds with JSON if no authorization header', function (done) {
		request(app).get('/api/create_thumbmail').expect('Content-Type', /json/).end(function (err, res) {
			if (err) return done(err);
			done();
		});
	});
	it('it responds with JSON if good authorization header but public_image_url doesnt point to an image or server is unable to fetch image from the public_image_url', function (done) {
		var token = jwt.sign({
			id: 1,
		}, config.JWT_SECRET, {
			expiresIn: 60 * 60 * 24 * 365
		});
		request(app)
			.get('/api/create_thumbmail')
			.set('Authorization', token)
			.send({
				public_image_url: "malformed.url/no_image.png"
			})
			.expect('Content-Type', /json/)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});
	it('it responds with a thumbmail if good authorization header and public_image_url points to an image', function (done) {
		var token = jwt.sign({
			id: 1,
		}, config.JWT_SECRET, {
			expiresIn: 60 * 60 * 24 * 365
		});
		request(app)
			.get('/api/create_thumbmail')
			.query({
				public_image_url: "https://dummyimage.com/600x400/000/fff",
			})
			.set('Authorization', token)
			.expect('Content-Type', /image/)
			.end(function (err, res) {
				if (err) return done(err);
				done();
			});
	});
	it('it responds with 50x50 thumbmail if good authorization header and public_image_url points to an image', function (done) {
		var token = jwt.sign({
			id: 1,
		}, config.JWT_SECRET, {
			expiresIn: 60 * 60 * 24 * 365
		});

		function binaryParser(res, callback) {
			res.setEncoding('binary');
			res.data = '';
			res.on('data', function (chunk) {
				res.data += chunk;
			});
			res.on('end', function () {
				callback(null, new Buffer(res.data, 'binary'));
			});
		}

		request(app)
			.get('/api/create_thumbmail')
			.query({
				public_image_url: "https://dummyimage.com/600x400/000/fff",
			})
			.set('Authorization', token)
			.expect('Content-Type', /image/)
			.buffer()
			.parse(binaryParser)
			.end(function (err, res) {
				if (err) return done(err);
				var dimensions = sizeOf(res.body);
				if (dimensions.width === dimensions.height && dimensions.height == 50) {
					done();
				} else {
					done("size not equal")
				}
			});
	});
});
