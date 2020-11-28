console.log('Twitter bot is running..');

var fs = require('fs'),
	path = require('path'),
	Twit = require('twit'),
	images = require(path.join(__dirname, 'images.js')),
	config = require(path.join(__dirname, 'config.js'));

var T = new Twit(config);

function getRandomImage(images) {
	var obj = images[Math.floor(Math.random() * images.length)];
	return obj.file.toString();
}

function uploadImage(images){
	console.log('Loading an image.');
	var fileName = getRandomImage(images);
	console.log('Loaded image: ' + fileName.toString());
	var imagePath = path.join(__dirname, '/images/' + fileName),
    	b64content = fs.readFileSync(imagePath, { encoding: 'base64' });
	console.log('Uploading an image...');
	T.post('media/upload', { media_data: b64content }, function (err, data, response) {
    	if (err) {
      		console.log('ERROR:');
      		console.log(err);
    	} else {
      		console.log('Image uploaded!');
      		console.log('Now tweeting it...');
      		T.post('statuses/update', {
          		media_ids: new Array(data.media_id_string)
        		},
        		function(err, data, response) {
          			if (err) {
            			console.log('ERROR:');
            			console.log(err);
          			} else {
            			console.log('Posted an image!');
            			deleteImage(fileName);
          			}
        		}
        	);
    	}
  	});
}

function deleteImage(fileName) {
	fs.unlink(path.join(__dirname, '/images/' + fileName), (err) => {
  		if (err) {
    		console.error(err);
    		return;
  		} else {
  			console.log('Deleted image: ' + fileName.toString());
  		}
	});
}

function renameImages(folderName) {
	const files = fs.readdirSync(path.join(__dirname, '/' + folderName + '/'));
	var i = 1;
	for (const file of files) {
		var stringNum = i.toString();
		var numZeros = (4 - stringNum.length);
		var newFileName = "";
		for (var x = 0; x < numZeros; x++) {
			newFileName += "0";
		}
		newFileName += i;
		fs.rename(
	  		__dirname + '/' + folderName + '/' + file,
	  		__dirname + '/' + folderName + '/' + newFileName + '.jpg',
	  		err => {
	    		console.log(err);
	  		}
		);
		i += 1;
	}
}