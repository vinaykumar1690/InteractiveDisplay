var model = require('./model.js');

var callback = function(args) {
	for (i in args) {
		record = args[i];
		console.log('user:' + record.userName + '\tscore:' + record.score);
	}
}
model.getTopNUsers(5, callback);