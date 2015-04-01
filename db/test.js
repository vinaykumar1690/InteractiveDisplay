var model = require('./model.js');

var callback = function(args) {
	console.log(new Date(Date.now()).toGMTString());
	for (i in args) {
		record = args[i];
		console.log('user:' + record.userName + '\tscore:' + record.score);
	}
}


var per = function() {
	model.getTopNUsers(5, callback);
};

setInterval(per, 1000);