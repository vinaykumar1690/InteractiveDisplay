var dbdriver = require('./dbdriver');


// Create a new user profile in CouchDB.
// If the userName is duplicate, a random number is appended.
exports.createUser = function(userName, callback) {

	var obj = JSON.stringify({
		score : 0,
		created_at: new Date(Date.now()).toGMTString(),
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
			var createTime = JSON.parse(body).created_at;
			var updatedTime = JSON.parse(body).updated_at;
			if (updatedTime === undefined) {
				updatedTime = [];
			}
			updatedTime.push(new Date(Date.now()).toGMTString());
			
			var data = JSON.stringify({
				score : score,
				updated_at: updatedTime,
				created_at: createTime,
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

exports.getTopNUsers = function(N, callback) {

	var comparator = function(record1, record2) {
		return record2.score - record1.score;
	}

	var onRowResponse = function(total) {
		
		var records = [];
		
		return function() {

			return function(res) {

				body = "";
			
				res.on('data', function(data) {
					//console.log(data);
					body += data;
				});

				res.on('end', function() {
					
					result = JSON.parse(body);
					
					records.push(result);
					
					if (records.length === total) {
						
						records.sort(comparator);
						
						var param = [];
						
						for (i = 0; i < N && i < records.length; i++) {
							var bundle = {
								userName : records[i]._id,
								score: records[i].score,
							}
							param.push(bundle);
						}
						callback(param);
					}
					body = "";
				})
			}
		}
	}

	var onDBGetResponse = function(res) {

		body = "";

		res.on('data', function(data) {
			body += data;
		});

		res.on('end', function() {
			result = JSON.parse(body).rows;
			onRowResponse = onRowResponse(result.length);
			for (i in result) {
				row = result[i];
				dbdriver.transaction('users', row.id, 'GET', null, onRowResponse(), onReqError);
			}

		});
	}

	var onReqError = function(err) {
		console.log('Update user[' + userName + '] score error:' + err.message);
	};

	dbdriver.transaction('users', '_all_docs', 'GET', null, onDBGetResponse, onReqError);
}

