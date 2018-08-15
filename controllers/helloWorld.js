module.exports = function (router) {
	const readChunk = require('read-chunk'); // npm install read-chunk image-type image-size --save
	const imageType = require('image-type');
	var path = require('path');
	var config = require('../config.js');
	const fs = require('fs');
	const resizeImg = require('resize-img');

	router.post('/apply_json_patch', function (req, res) {
		var jsonpatch = require('fast-json-patch');

		var jsonPatch = req.body.json_patch;
		var jsonObjectToPatch = req.body.json_object_to_patch;
		if (!jsonPatch || (typeof jsonPatch != 'object') || !Array.isArray(jsonPatch)) {
			res.status(200).json({
				success: false,
				message: "the json patch provided is not valid"
			});
		} else if (!jsonObjectToPatch || (typeof jsonObjectToPatch != 'object')) {
			res.status(200).json({
				success: false,
				message: "the json object to patch provided is not valid"
			});
		} else {
			jsonObjectToPatch = jsonpatch.applyPatch(jsonObjectToPatch, jsonPatch).newDocument;
			res.status(200).json({
				success: true,
				patched_object: jsonObjectToPatch
			});
		}
	});

	router.get('/create_thumbmail', function (req, res) {
		var publicImageURL = req.query.public_image_url;
		if (publicImageURL && typeof publicImageURL == 'string') {
			//var publicImageURL = "https://dummyimage.com/600x400/000/fff";
			var downloadsDirectory = path.normalize('./public/downloads/');
			var downloadsDirectoryResized = path.normalize('./public/downloads/resized/');
			const download = require('images-downloader').images;
			download([publicImageURL], downloadsDirectory)
				.then(result => {
					if (result && result[0] && result[0].filename) {
						//var justDownloadedile = path.normalize('./public/downloads/' + result[0].filename);
						var justDownloadedile = result[0].filename;
						resizeImg(fs.readFileSync(justDownloadedile), {
								width: 50,
								height: 50
							}).then(buf => {
								var theImageType = imageType(buf);
								/*
									fs.writeFileSync(downloadsDirectoryResized + "res.png", buf);
									res.json({
										success: true,
										imageBuff: buf
									});
								res.send(new Buffer(buf, 'binary'))
									*/
								var extVal = "";
								if (theImageType && theImageType.mime) {
									res.header('Content-Type', theImageType.mime);
									extVal = "." + theImageType.ext;
								} else {
									var ext = /^.+\.([^.]+)$/.exec(justDownloadedile);
									extVal = ext == null ? "" : "." + ext[1];
								}
								res.header('Content-Disposition', 'attachment; filename="resixed50' + extVal + '"');
								res.send(buf);
							})
							.catch(error => res.json(error));
					} else {
						res.json(result)
					}
				})
				.catch(error => res.json(error));
		} else {
			res.json({
				success: false,
				message: "invalid public image provided"
			});
		}
	});
	return router;
};
