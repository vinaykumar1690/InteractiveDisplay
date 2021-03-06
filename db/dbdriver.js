querystring = require('querystring');
http = require('http');
url  = require('../url/url.js');

exports.transaction = function(table, uuid, method, object, onResponse, onError) {
	var options = {
		host: url.dbURL, 
		port: "5984",
		path: "/" + table + '/' + uuid,
		method: method, 
		headers: {
			'Content-Type' : 'application/json',
			'Accept': 'application/json',
		},
	}

	var req = http.request(options, onResponse);

	req.on('error', onError);

	if (object !== null) {
		req.write(object);
	}
	req.end();
}




