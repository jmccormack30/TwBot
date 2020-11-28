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