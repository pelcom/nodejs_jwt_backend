var jwt = require('jsonwebtoken');
var path = require('path');
var config = require('../config.js');
const fs = require('fs');
const resizeImg = require('resize-img');


module.exports = function (router) {
	router.post('/login', function (req, res) {
		var username = req.body.username;
		var password = req.body.password;
		/*
		 * Check if the username and password is correct
		 */
		if (typeof username != 'string') {
			res.status(401).json({
				success: false,
				message: 'username should be a simple string!'
			});
		} else if (typeof password != 'string') {

			res.status(401).json({
				success: false,
				message: 'password should be a simple string!'
			});
		} else if (password.length < 6) {

			res.status(401).json({
				success: false,
				message: 'password should be more than 5 characters'
			});
		} else if (username.length < 3) {

			res.status(401).json({
				success: false,
				message: 'username should be more than 2 characters'
			});
		} else {
			res.json({
				success: true,
				username: username,
				message: 'successful authenticaion for ' + username,
				jwt: jwt.sign({
					id: 1,
				}, config.JWT_SECRET, {
					expiresIn: 60 * 60 * 24 * 365
				})
			});
		}
	});


	return router;
};
