var getAnswer = require('./getAnswer.js');
var questions = require('./cities_and_types.js');

var onResponse = function() {
	
	var bundle = {
		option0 : null,
		option1 : null,
	}

	return function (opt) {

		var opt;

		return function(res) {
			res.setEncoding('utf8');
			responseBody = "";

			res.on('data', function(d) {
				responseBody += d;
			});

			res.on('end', function() {
				responseBody = JSON.parse(responseBody);
				if (opt === 0) {
					bundle.option0 = responseBody.results.length;
					if (bundle.option1 !== null) {
						console.log('from opt0: ' + bundle);
					}

				} else if (opt === 1) {
					bundle.option1 = responseBody.results.length;
					if (bundle.option0 !== null) {
						console.log('from opt1: ' + bundle);
					}
				}
			});
		}
	}
}();

var onError = function(err) {
	console.log('err');
}


question = questions.getQuestion();

getAnswer.getAnswer(0, question.city1.lat ,question.city1.lng, 2 * 1000, question.type, onResponse, onError, null);
getAnswer.getAnswer(1, question.city2.lat ,question.city2.lng, 2 * 1000, question.type, onResponse, onError, null);