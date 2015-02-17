var autobahn = require('autobahn');

var connection = new autobahn.Connection({
	url: 'ws://127.0.0.1:8080/ws',
	realm: 'realm1'
})


connection.onopen = function(session){

	console.log("backend connected.");

	var handler = {
		session: session,
	}

	var question = {
		seq: 1,
		question: 'Hello world!',
		options: ["Yes", "No"], 
	}

	var submitAnswer = function(args) {
		var answer = args[0];
		console.log("Recv an answer of Q" + answer.qSEQ + " with choice " + answer.opt);
	}

	session.register('edu.cmu.ipd.onpoll', submitAnswer).then(
      function (reg) {
         console.log('submitAnswer registered');
      },
      function (err) {
         console.log('failed to register submitAnswer', err);
      }
   );
	
	var issueQuestion = function() {
		session.publish('edu.cmu.ipd.questions', [question]);
		question.seq += 1;
	}

	t1 = setInterval(issueQuestion, 3000);
}

connection.open();