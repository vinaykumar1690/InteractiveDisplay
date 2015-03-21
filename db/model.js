var dbdriver = require('./dbdriver');


// Create a new user profile in CouchDB.
// If the userName is duplicate, a random number is appended.
exports.createUser = function(userName, callback) {

	var obj = JSON.stringify({
		'score' : 0,
	});

	var appliedUserName = userName;
	var onResponse = function(res) {
		if (res.statusCode === 201) {
			console.log("Create a new user: " + appliedUserName);
			callback(appliedUserName);
		} else if (res.statusCode === 409) { //Conflict
			appliedUserName = userName + (Math.floor(Math.random() * 100)+1);
			dbdriver.transaction('users', appliedUserName,'PUT', obj, onResponse, onReqError);
		}
	}

	var onReqError = function(e){
		console.log("error: " + e.message);
	};

	dbdriver.transaction('users', userName, 'PUT', obj, onResponse, onReqError);

}

