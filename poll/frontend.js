var autobahn = require('autobahn');

var connection = new autobahn.Connection({
	url: 'ws://127.0.0.1:8080/ws',
	realm: 'realm1'
})


connection.onopen = function(session){

	console.log("frontend connected.");

	var question;

	var onNewQuestion = function(args) {
		question = args[0];
		// console.log("Q#" + question.seq + ":" + question.question);
		// console.log("Opt1:" + question.options[0] + "\tOpt2:" + question.options[1]);
		console.log(question);
	}


	session.subscribe("edu.cmu.ipd.questions", onNewQuestion).then(
      function (sub) {
         console.log('subscribed to topic');
      },
      function (err) {
         console.log('failed to subscribe to topic', err);
      });

	var formAnswer = function(qSEQ, optNum) {
		var answer = {
			qSEQ: qSEQ,
			opt: optNum, 
		}
		return answer;
	}
	var submitAnswer = function(answer) {
		session.call('edu.cmu.ipd.onpoll', [answer]).then(
			function (res) {
				console.log("successfully submit answer");
			}
		);
	}

	setTimeout(function() {submitAnswer(formAnswer(0, 1))}, 5000);
	
}

connection.open();