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
