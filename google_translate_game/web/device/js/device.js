var connection = new autobahn.Connection({
	url: 'ws://' + location.host + '/ws',
	realm: 'realm1'
});


var appliedUserName = window.location.search.split('=')[1];

var subscribeHandler;
var answerSubmitted = null;
var answerLastRound = null;

var score = 0;

var cachedUserName = [];
var cachedToken    = [];



connection.onopen = function(session){

	console.log('node connected.');

	session.subscribe("edu.cmu.ipd.rounds.newRound", onDisplayOptions).then(
		function (sub) {
			console.log('subscribed to topic');
		},
		function (err) {
			console.log('failed to subscribe to topic', err);
		});

	addOnClick(session);

	sessionHandler.call('edu.cmu.ipd.rounds.currentRound', []).then(onDisplayOptions, 
		 function(err) {
			console.log('[device]\tFailed to call .rounds.currentRound.');
		 });

}



/*
 * Display the options on device UI.
 */
var onDisplayOptions = function(args) {

	if (args[0] === null) {
		return;
	}

	if (answerSubmitted !== null && answerLastRound !== null) {
		//Correct Answer
		if (answerSubmitted === answerLastRound){
			var divAlert = document.createElement('div');
			divAlert.className = 'alert alert-success';
			divAlert.setAttribute('style', 'margin-top:1.5em');

			var aHref = document.createElement('a');
			aHref.setAttribute('href', '#');
			aHref.className = 'close';
			aHref.setAttribute('data-dismiss', 'alert'),
			aHref.innerHTML = '&times;';

			var strongTag =  document.createElement('strong');
			strongTag.innerHTML = 'Congratulations!';

			divAlert.appendChild(aHref);
			divAlert.appendChild(strongTag);
			// divAlert.innerHTML = divAlert.innerHTML + '  Your user name is ' + appliedUserName
			document.getElementById('demo_body').appendChild(divAlert);
			setTimeout(function() {
				document.getElementById('demo_body').removeChild(divAlert);
			}, 5000);
			answerSubmitted = null;
			score += 10;
		} else {
			//Wrong Answer
			var divAlert = document.createElement('div');
		 	divAlert.className = 'alert alert-warning';
		 	divAlert.setAttribute('style', 'margin-top:1.5em');

		 	var aHref = document.createElement('a');
		 	aHref.setAttribute('href', '#');
		 	aHref.className = 'close';
		 	aHref.setAttribute('data-dismiss', 'alert'),
		 	aHref.innerHTML = '&times;';

		 	var strongTag =  document.createElement('strong');
		 	strongTag.innerHTML = 'Sorry!';

		 	divAlert.appendChild(aHref);
		 	divAlert.appendChild(strongTag);
		 	divAlert.innerHTML = divAlert.innerHTML + '  The correct answer is ' + $('#pollContainer').attr('answer-body');
		 	document.getElementById('demo_body').appendChild(divAlert);
		 	setTimeout(function() {
				document.getElementById('demo_body').removeChild(divAlert);
			}, 5000);

			answerSubmitted = null;
			score = Math.max(0, score - 5);
		}

		sessionHandler.call('edu.cmu.ipd.users.updateScore', [appliedUserName, score]).then(
		 	function(res) {
				console.log('Updated score at the backend.');
		 	},
		 	function(err) {
				console.log('Failed to update score at the backend', err);
		 	});

		document.getElementById('score').innerHTML = 'Score: ' + score;
	}

	document.getElementById("A").disabled = false;
	document.getElementById("B").disabled = false;

	if (args[0].gameType === 'places') {
		// City names to display on buttons
		var cities = args[0].options; 
		var city1;
		var city2;

		// Answer
		answerLastRound = args[0].answer;
		if (cities.length === 2 ){
			city1 = cities[0].name;
			city2 = cities[1].name;

			$('#A').text(city1);
			$('#A').css('background-color', '#D4D0C8');

			$('#B').text(city2);
			$('#B').css('background-color', '#D4D0C8');
		}
	} else if (args[0].gameType === 'translator') {
		
		answerLastRound = args[0].answer;

		$('#A').text('Blue Path');
		$('#A').css('background-color', '#D4D0C8');

		$('#B').text('Red Path');
		$('#B').css('background-color', '#D4D0C8');

		var answerBody = null;
		if (args[0].answer === 0) {
			answerBody = 'Blue Path';
		} else {
			answerBody = 'Red Path';
		}
		$('#pollContainer').attr('answer-body', answerBody);

	}
}// end onDisplayOptions

var shortenDisplayName = function(appliedUserName) {
	if (appliedUserName.length > 6) {
		return appliedUserName.substring(0, 3) + "..." 
		+ appliedUserName.substring(appliedUserName.length-3, appliedUserName.length);
	} else {
		return appliedUserName;
	}
}

var addOnClick = function(sessionHandler) {

	// Add OnClick events
	document.getElementById("A").onclick = function (event) {

		if (answerSubmitted === 0) {
			return;
		}

		document.getElementById('A').style.backgroundColor = 'rgb(196, 88, 173)';
		document.getElementById('B').style.backgroundColor = '#D4D0C8';

		param = [];
		param.push(appliedUserName);
		if (answerSubmitted === null) {
			param.push('Submit ' + $('#A').html());
		} else {
			param.push('Change to ' + $('#A').html())
		}

		answerSubmitted = 0;
		sessionHandler.call('edu.cmu.ipd.users.submitAnswer', param).then(
			function(res) {
				console.log('submitted user choice');
			},
			function(err) {
				console.log('failed to submit user choice.', err);
			});
	}

	document.getElementById("B").onclick = function (event) {

		if (answerSubmitted === 1) {
			return;
		}

		document.getElementById('B').style.backgroundColor = 'rgb(196, 88, 173)';
		document.getElementById('A').style.backgroundColor = '#D4D0C8';
		// console.log("answer submitted: " + $('#B').html());

		param = [];
		param.push(appliedUserName);
		if (answerSubmitted === null) {
			param.push('Submit ' + $('#B').html());
		} else {
			param.push('Change to ' + $('#B').html())
		}

		answerSubmitted = 1;
		sessionHandler.call('edu.cmu.ipd.users.submitAnswer', param).then(
			function(res) {
				console.log('submitted user choice');
			},
			function(err) {
				console.log('failed to submit user choice.', err);
			});
	}
}

connection.open();
$('#user_name').text("Player: " + shortenDisplayName(window.location.search.split('=')[1]));