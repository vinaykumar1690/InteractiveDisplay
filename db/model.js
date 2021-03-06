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
			dbdriver.transaction('andrew_id', appliedUserName,'PUT', obj, onResponse, onReqError);
		}
	}

	var onReqError = function(e){
		console.log("error: " + e.message);
	};

	dbdriver.transaction('andrew_id', userName, 'PUT', obj, onResponse, onReqError);
}

exports.updateScore = function(userName, score) {
	
	console.log('model.updateScore: userName = ' + userName + '   score = ' + score);
	var onPutResponse = function(res) {
		
		var body = "";
		
		res.on('data', function(data) {
			body += data;
		});

		res.on('end', function() {
			console.log(body);
		});
	}


	var onGetResponse = function(res) {
		
		var body = "";
		
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
			
			dbdriver.transaction('andrew_id', userName, 'PUT', data, onPutResponse, onReqError);

		});
	};

	var onReqError = function(err) {
		console.log('Update user[' + userName + '] score error:' + err.message);
	};

	dbdriver.transaction('andrew_id', userName, 'GET', null, onGetResponse, onReqError);
}

exports.getTopNUsers = function(N, callback) {

	var comparator = function(record1, record2) {
		if (record2.score !== record1.score) {
			return record2.score - record1.score;
		} else {
			return record1._id.localeCompare(record2._id);
		}
	}

	var onRowResponse = function(total) {
		
		var records = [];

		return function(res) {

			var body = "";
		
			res.on('data', function(data) {
				//console.log(data);
				body += data;
			});

			res.on('end', function() {
				
				var result = JSON.parse(body);
				
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
			});
		}
	}

	var onDBGetResponse = function() {

		var body = "";

		return function(res) {
			res.on('data', function(chunk) {
				// console.log('append:\t' + chunk);
				body += chunk;
			});

			res.on('end', function() {
				// console.log(body);
				result = JSON.parse(body).rows;
				onRowResponse = onRowResponse(result.length);
				for (var i = 0; i < result.length; i++) {
					var row = result[i];
					dbdriver.transaction('andrew_id', row.id, 'GET', null, onRowResponse, onRowsReqError);
				}

			});

			res.on('error', function(e) {
  				console.log("[model].getTopNUsers.onDBGetResponse: error: " + e.message);
			});
		}
	}

	var onRowsReqError = function(err) {
		console.log('Get rows error:' + err.message);
	};

	var onRowReqError = function(err) {
		console.log('Get row error:' + err.message);
	}

	dbdriver.transaction('andrew_id', '_all_docs', 'GET', null, onDBGetResponse(), onRowsReqError);
}

