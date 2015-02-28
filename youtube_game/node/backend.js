var autobahn = require('autobahn');

var connection = new autobahn.Connection({
	url: 'ws://127.0.0.1:8080/ws',
	realm: 'realm1'
})


connection.onopen = function(session){

	console.log("backend connected.");
	
	/* Current question counter */
	var questionCounter = 0;

	/* Answer collections */
	var answers = [];


	/* Question pool */
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

	/* Register RPC call. This RPC is called by client to submit answer */
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
      });
	

	/* Periodically generate questions and push to client */
	var issueQuestion = function() {
		i = ++questionCounter % 3;
		question = questions[i];
		answer   = answers[i] === undefined ? 
			[0, 0, 0] : answers[i].optsCounter;
		session.publish('edu.cmu.ipd.questions', [question, answer]);
	}

	t1 = setInterval(issueQuestion, 5000);


	/* This RPC is called when webpage loaded */
	var loadQuestion = function() {
		var retQ = questions[questionCounter % 3];
		var retAnswerOpts = answers[questionCounter % 3] === undefined ? 
			[0, 0, 0] : answers[questionCounter % 3].optsCounter;
		return [retQ, retAnswerOpts];
	}

	session.register("edu.cmu.ipd.loadquestion", loadQuestion).then(
		function(reg) {
			console.log("succeed to register .loadquestion");
		},
		function(err) {
			console.log("fail to register .loadquestion");
		});
}

connection.open();