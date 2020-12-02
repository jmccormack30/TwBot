var fs = require('fs'),
	path = require('path'),
	Twit = require('twit'),
	nodemailer = require('nodemailer'),
	images = require(path.join(__dirname, 'images.js')),
	email = require(path.join(__dirname, 'email.js')),
	dates = require(path.join(__dirname, 'dates.js')),
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
      		sendErrorEmail();
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
            			sendErrorEmail();
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
    		sendErrorEmail();
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

function sendErrorEmail() {
	var emailData = email[0];
	var transporter = nodemailer.createTransport({
  		service: 'gmail',
 		auth: {
    		user: emailData.address.toString(),
    		pass: emailData.password.toString()
  		}
	});

	var mailOptions = {
  		from: emailData.from.toString(),
  		to: emailData.to.toString(),
  		subject: emailData.subject.toString(),
  		text: emailData.text.toString()
	};

	transporter.sendMail(mailOptions, function(error, info) {
  		if (error) {
    		console.log(error);
  		} else {
    		console.log('Email sent: ' + info.response);
  		}
	});
}

function checkForTweet() {
	T.get('statuses/user_timeline', { screen_name: 'SerPounce2'}, function(err, data) {
		if (!err) {
			date_dict = dates[0];
			// Twitter returns created date in UTC
			var newest = data[0];
			var tweet_date = newest.created_at;
			var split_tweet_date = tweet_date.split(" ");
			var tweetYear = split_tweet_date[5];
			var tweetMonth = date_dict[split_tweet_date[1]];
			var tweetDay = split_tweet_date[2];
			var tweetTime = split_tweet_date[3].split(":");
			var tweetHour = tweetTime[0];
			var tweetMinute = tweetTime[1];

			// Get current date in UTC 
			var current_date = new Date().toUTCString();
			var split_current_date = current_date.split(" ");
			var currentYear = split_current_date[3];
			var currentMonth = date_dict[split_current_date[2]];
			var currentDay = split_current_date[1];
			var currentTime = split_current_date[4].split(":");
			var currentHour = currentTime[0];
			var currentMinute = currentTime[1];

			// Create the JavaScript date objects
			var d1 = new Date(parseInt(tweetYear), parseInt(tweetMonth), parseInt(tweetDay), parseInt(tweetHour), parseInt(tweetMinute));
			var d2 = new Date(parseInt(currentYear), parseInt(currentMonth), parseInt(currentDay), parseInt(currentHour), parseInt(currentMinute));

			// Calculates the # of hours since last tweet
			var deltaTime = Math.abs(d1.getTime() - d2.getTime());
			var deltaHours = deltaTime / (1000*60*60);

			if (deltaHours >= 24) {
				console.log("It has been 24 hours.. time to tweet!");
				uploadImage(images);
			}
		} else {
			console.log(err);
			console.log("ERROR");
			sendErrorEmail();
		}
	});
}

console.log('TwBot is running...\n');

const minuteInterval = 5;

// Check every X minutes
setInterval(() => checkForTweet(), (1000 * 60 * minuteInterval));