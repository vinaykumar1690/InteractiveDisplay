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
		console.log("Q#" + question.seq + ":" + question.question);
		console.log("Opt1:" + question.options[0] + "\tOpt2:" + question.options[1]);
	}


	session.subscribe("edu.cmu.ipd.questions", onNewQuestion).then(
      function (sub) {
         console.log('subscribed to topic');
      },
      function (err) {
         console.log('failed to subscribe to topic', err);
      }
   );

	var submitAnswer = function() {
		var answer = {
			qSEQ : question.seq,
			opt  : 0,  
		}

		session.call('edu.cmu.ipd.onpoll', [answer]).then(
			function (res) {
				console.log("successfully submit answer");
			}
		);
	}

	setTimeout(submitAnswer, 5000);
	
}

connection.open();