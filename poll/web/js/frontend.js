// var autobahn = require('autobahn');

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
		console.log(question.question);
		document.getElementById("questionText").innerHTML = question.question;
		document.getElementById("questionText").setAttribute("seqno",question.seq);
		document.getElementById("choiceTextA").innerHTML = question.options[0];
		document.getElementById("choiceTextB").innerHTML = question.options[1];
		document.getElementById("choiceTextC").innerHTML = question.options[2];
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

	var choiceButtons = document.getElementById("pollContainer").
		getElementsByTagName("button");
	for (var i = 0; i < choiceButtons.length; i++) {
		choiceButtons[i].onclick = function(evt) {
			var qSEQ = document.getElementById("questionText").getAttribute("seqno");
			var choiceId = evt.target.id;
			var optNum = choiceId === "A" ? 0 : (choiceId === "B" ? 1 : 2);
			var ans = formAnswer(qSEQ, optNum);
			submitAnswer(ans);
			console.log("target.id: " + optNum + "/" + choiceId + "   Q#:" + qSEQ);
		}
	}


	
}

connection.open();