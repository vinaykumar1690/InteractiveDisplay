var autobahn = require('autobahn');

var connection = new autobahn.Connection({
	url: 'ws://127.0.0.1:8080/ws',
	realm: 'realm1'
})


connection.onopen = function(session){

	console.log("backend connected.");
	
	var questionCounter = 0;


	var handler = {
		session: session,
	}

	var question0 = {
		seq: 0,
		question: 'When was cmu founded?',
		options: ["1900", "1905", "1910"], 
	}

	var question1 = {
		seq: 1,
		question: 'Where is the main campus of CMU?',
		options: ['Pittsburgh, PA', 'Mountain View, CA', 'Guangzhou, China']
	}

	var question2 = {
		seq: 2,
		question: "Who did Vinay date with on Feb 17?",
		options: ["Venkey", "Megha", "Pei"]
	}

	var questions = [question0, question1, question2];
	var answers = [];

	var submitAnswer = function(args) {
		var answer = args[0];
		if (answers[answer.qSEQ] === undefined) {
			answers[answer.qSEQ] = {
				seq: answer.qSEQ,
				optsCounter:[0, 0, 0]
			}
		}
		answers[answer.qSEQ].optsCounter[answer.opt] += 1;
		var update = {
			optSEQ : answer.opt,
			value  : answers[answer.qSEQ].optsCounter[answer.opt]
		}
		console.log(update);
		session.publish("edu.cmu.ipd.onvote", [update]);
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
		var i = questionCounter%3;
		questionCounter += 1;
		session.publish('edu.cmu.ipd.questions', [questions[i]]);
	}

	t1 = setInterval(issueQuestion, 5000);
}

connection.open();