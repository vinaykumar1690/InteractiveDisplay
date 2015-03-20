var dbdriver = require('./dbdriver');


// Create a new user profile in CouchDB.
// If the userName is duplicate, a random number is appended.
exports.createUser = function(userName) {

	var obj = JSON.stringify({
		'score' : 0,
	});

	var onResponse = function(res) {
		if (res.statusCode === 201) {
			console.log("Create a new user");
		} else if (res.statusCode === 409) { //Conflict
			dbdriver.transaction('users', userName + Math.floor((Math.random() * 100) + 1),
			 'PUT', obj, onResponse, onReqError);
		}
	}

	var onReqError = function(e){
		console.log("error: " + e.message);
	};

	dbdriver.transaction('users', userName, 'PUT', obj, onResponse, onReqError);

}

