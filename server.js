var fs = require('fs'),
	path = require('path'),
	Twit = require('twit'),
	images = require(path.join(__dirname, 'images.js')),
	config = require(path.join(__dirname, 'config.js'));

var T = new Twit(config);

function getRandomIndex(images) {
	return Math.floor(Math.random() * images.length);
}

function getImage(images, index) {
	return images[index].file.toString();
}

function uploadImage(images){
	console.log('Loading an image.');
	var index = getRandomIndex(images);
	var fileName = getImage(images, index);
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
            			deleteImage(fileName, index);
          			}
        		}
        	);
    	}
  	});
}

function deleteImage(fileName, index) {
	// Delete image file from directory
	fs.unlink(path.join(__dirname, '/images/' + fileName), (err) => {
  		if (err) {
    		console.error(err);
    		return;
  		} else {
  			console.log('Deleted image: ' + fileName.toString());
  		}
	});
	// Delete image entry from json
	images.splice(index, 1);
}

console.log('TwBot is running...');

// Run once to tweet on startup
uploadImage(images);

const hourInterval = 24;

// Tweet every X hours
setInterval(() => uploadImage(images), (1000 * 60 * 60 * hourInterval));