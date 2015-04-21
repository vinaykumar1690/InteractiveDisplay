var https = require('https');


exports.getAnswer = function(opt, latitude, longitude, radius, placeType, onResponse, onError, pageToken) {

	
	var options = {
		hostname: 'maps.googleapis.com',
		port: 443,
		path: '/maps/api/place/radarsearch/json?location=' + latitude + ',' + longitude 
			+ '&radius=' + radius + '&types=' + placeType + '&sensor=false'
			+ '&key=AIzaSyALWxgT7ALon32ohU5-fB-IWbmzbwSIDmg',
		method: 'GET'
	}

	if (pageToken !== null) {
		options.path = options.path + '&pagetoken=' + pageToken;
	}

	console.log("url:" + "https://" + options.hostname + options.path);

	var req = https.request(options, onResponse(opt));

	req.on('error', onError);

	req.end();  
}

var onError = function(err) {
    console.log('err');
}
