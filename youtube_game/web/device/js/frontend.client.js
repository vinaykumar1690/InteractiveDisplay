// var autobahn = require('autobahn');

var connection = new autobahn.Connection({
	url: 'ws://10.0.17.206:80/ws',
	realm: 'realm1'
})

var bundle;

var buttonA = document.getElementById("pollContainer").getElementsByTagName("button")[0];
var buttonB = document.getElementById("pollContainer").getElementsByTagName("button")[1];

var chosenButton;

var onload = true;

buttonA.onclick = function(evt) {
	// if (buttonA.getAttribute("iscorrect") === "true") {
	// 	document.getElementById('result').innerHTML = 'Congratulations!';
	// 	document.getElementById('score').value = document.getElementById('score').value * 1 + 1;
	// } else {
	// 	document.getElementById('result').innerHTML = 'Sorry!';
	// }

	chosenButton = buttonA;
	buttonA.disabled = true;
	buttonB.disabled = true;
}

buttonB.onclick = function(evt) {
	// if (buttonB.getAttribute("iscorrect") === "true") {
	// 	document.getElementById('result').innerHTML = 'Congratulations!';
	// 	document.getElementById('score').value = document.getElementById('score').value * 1 + 1;
	// } else {
	// 	document.getElementById('result').innerHTML = 'Sorry!';
	// }
	chosenButton = buttonB;
	buttonA.disabled = true;
	buttonB.disabled = true;
}

document.getElementById('score').value = 50;

connection.onopen = function(session){

	console.log("frontend connected.");

	var question;

	/* Subscribe to .questions channel. This message is published
	   when a new round of game starts. */
	var onNewChoice = function(args) {
		if (onload) {
			loadNewChoice(args[0]);
			onload = false;
		} else {
			setTimeout(function(){loadNewChoice(args[0])}, 3000);
			
			if (chosenButton.getAttribute("iscorrect") === "true") {
				document.getElementById('result').innerHTML = 'Congratulations!';
				document.getElementById('score').value = document.getElementById('score').value * 1 + 1;
			} else {
				document.getElementById('result').innerHTML = 'Sorry!';
			}
		}
	}

	function loadNewChoice(bundle) {
		if (Math.random() >= 0.5) {
			document.getElementById("choiceTextA").innerHTML = bundle.answer;
			buttonA.setAttribute("iscorrect", "true");
			document.getElementById("choiceTextB").innerHTML = bundle.alternative;
			buttonB.setAttribute("iscorrect", "false");
		} else {
			document.getElementById("choiceTextB").innerHTML = bundle.answer;
			buttonB.setAttribute("iscorrect", "true");
			document.getElementById("choiceTextA").innerHTML = bundle.alternative;
			buttonA.setAttribute("iscorrect", "false");
		}

		buttonA.disabled = false;
		buttonB.disabled = false;
		document.getElementById('result').innerHTML = '';
	}


	session.subscribe("edu.cmu.ipd.device.choice.next", onNewChoice).then(
      function (sub) {
         console.log('subscribed to .questions');
      },
      function (err) {
         console.log('failed to subscribe to .questions', err);
      });

	session.call('edu.cmu.ipd.device.bundle', []).then(
		function(response) {
			console.log("device.front: ");
			console.log(response);
			onNewChoice([response]);
		},
		function(err) {
			console.log('failed to call device.bundle: ' + err);
		});
	
}

connection.open();