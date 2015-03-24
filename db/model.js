var dbdriver = require('./dbdriver');


// Create a new user profile in CouchDB.
// If the userName is duplicate, a random number is appended.
exports.createUser = function(userName, callback) {

	var obj = JSON.stringify({
		score : 0,
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

exports.updateScore = function(userName, score) {
	
	console.log('model.updateScore: userName = ' + userName + '   score = ' + score);
	var onPutResponse = function(res) {
		body = "";
		res.on('data', function(data) {
			body += data;
		});
		res.on('end', function() {
			console.log(body);
		})
	}


	var onGetResponse = function(res) {
		
		body = "";
		res.on('data', function(data) {
			body += data;
		});
		

		res.on('end', function() {
			
			var seq = JSON.parse(body)._rev;
			
			var data = JSON.stringify({
				score : score,
				_rev  : seq,
			});
			
			dbdriver.transaction('users', userName, 'PUT', data, onPutResponse, onReqError);

		});
	};

	var onReqError = function(err) {
		console.log('Update user[' + userName + '] score error:' + err.message);
	};

	dbdriver.transaction('users', userName, 'GET', null, onGetResponse, onReqError);
}

