var getAnswer = require('./getAnswer.js');
var questions = require('./cities_and_types.js');

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
		});
	}
}

var onError = function(err) {
	console.log('err');
}

console.log();

question = questions.getQuestion();
console.log(question);
getAnswer.getAnswer(question.city1.lat ,question.city1.lng, 2 * 1000, question.type, onResponse(0), onError, null);


	