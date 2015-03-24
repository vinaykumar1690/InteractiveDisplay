var https = require('https');


exports.getAnswer = function(opt, latitude, longitude, radius, placeType, onResponse, onError, pageToken) {

	
	var options = {
		hostname: 'maps.googleapis.com',
		port: 443,
		path: '/maps/api/place/radarsearch/json?location=' + latitude + ',' + longitude 
			+ '&radius=' + radius + '&types=' + placeType + '&sensor=false'
			+ '&key=AIzaSyBv8Qjzf4KPVqu8Xk88SWYoGqJJ97cy8J0',
		method: 'GET'
	}

	if (pageToken !== null) {
		options.path = options.path + '&pagetoken=' + pageToken;
	}

	// console.log("url:" + "https://" + options.hostname + options.path);

	var req = https.request(options, onResponse(opt));

	req.on('error', onError);

	req.end();  
}

var onResponse = function(prev) {
	console.log('construct: ' + prev);
	var counts = prev;

	return function(res) {
		res.setEncoding('utf8');
		responseBody = "";
		res.on('data', function(d) {
			responseBody += d;
		});
		res.on('end', function() {
			responseBody = JSON.parse(responseBody);
			console.log(responseBody.results.length);
            return results;
		});
	}

}

var onError = function(err) {
    console.log('err');
}