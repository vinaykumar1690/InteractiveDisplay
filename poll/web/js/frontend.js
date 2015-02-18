// var autobahn = require('autobahn');

var connection = new autobahn.Connection({
	url: 'ws://127.0.0.1:8080/ws',
	realm: 'realm1'
})


connection.onopen = function(session){

	console.log("frontend connected.");

	var question;

	/* Subscribe to .questions channel. This message is published
	   when a new round of game starts. */
	var onNewQuestion = function(args) {
		question       = args[0];
		ansOptsCounter = args[1];
		console.log(question.question);
		document.getElementById("questionText").innerHTML = question.question;
		document.getElementById("questionText").setAttribute("seqno",question.seq);
		document.getElementById("choiceTextA").innerHTML = question.options[0];
		document.getElementById("choiceTextB").innerHTML = question.options[1];
		document.getElementById("choiceTextC").innerHTML = question.options[2];

		document.getElementById("pollsA").value = ansOptsCounter[0];
		document.getElementById("pollsB").value = ansOptsCounter[1];
		document.getElementById("pollsC").value = ansOptsCounter[2];
	}


	session.subscribe("edu.cmu.ipd.questions", onNewQuestion).then(
      function (sub) {
         console.log('subscribed to .questions');
      },
      function (err) {
         console.log('failed to subscribe to .questions', err);
      });



	/* Subscribe to .onvote channel. This message is published
	   when any client submit an answer */
	var onNewVote = function(args) {
		
		var update = args[0];
		var opt = update.optSEQ === 0 ? 'A' : (update.optSEQ === 1 ? 'B' : 'C');
		document.getElementById("polls" + opt).value = update.value;
	}

	session.subscribe("edu.cmu.ipd.onvote", onNewVote).then(
		function(sub) {
			console.log("subscribe to .onvote");
		},
		function(err) {
			console.log("fail to subscribe to .onvote");
		});



	/* Add oncClick listener to each button. Once a choice is clicked, it call RPC to backend */
	
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


	/* Retrieve the current question. This is only called only once upon loading the page */
	session.call("edu.cmu.ipd.loadquestion", [0]).then(
		function(res) {
			onNewQuestion(res);
		});



	
}

connection.open();