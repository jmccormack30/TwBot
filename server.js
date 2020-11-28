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
	printDate();
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
  			console.log('Deleted image: ' + fileName.toString() + '\n');
  		}
	});
	// Delete image entry from json
	images.splice(index, 1);
}

function printDate() {
	var datetime = new Date();
	var day = datetime.getDate();
	var month = datetime.getMonth()+1;
	var year = datetime.getFullYear();
	var dateString = month + '-' + day + '-' + year;
	var hour = datetime.getHours();
	var minuteStr = datetime.getMinutes().toString();

	var period = '';
	if (hour < 12 || hour == 24) {
		period = 'AM';
	} else {
		period = 'PM';
	}

	if (hour == 0 || hour == 24) {
		hour = 12;
	} else if (hour > 12 && hour < 24) {
		hour = hour - 12;
	}

	if (minuteStr.length == 1) {
		minuteStr = '0' + minuteStr;
	}

	var timeString = hour + ':' + minuteStr + ' ' + period;
	console.log(dateString + ' ' + timeString);
}

// console.log('TwBot is running...\n');

// // Run once to tweet on startup
// uploadImage(images);

// const hourInterval = 24;

// // Tweet every X hours
// setInterval(() => uploadImage(images), (1000 * 60 * 60 * hourInterval));

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'youremail@gmail.com',
    pass: 'yourpassword'
  }
});

var mailOptions = {
  from: 'youremail@gmail.com',
  to: 'myfriend@yahoo.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});