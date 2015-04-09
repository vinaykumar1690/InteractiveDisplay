var connection = new autobahn.Connection({
	url: 'ws://' + location.host + '/ws',
	realm: 'realm1'
});

document.getElementById('login').disabled = true;

var sessionHandler;

var userToken;
var appliedUserName;

var subscribeHandler;
var answerSubmitted = null;
var answerLastRound = null;

var score = 0;

var cachedUserName = [];
var cachedToken    = [];



connection.onopen = function(session){

	console.log('node connected.');

	sessionHandler = session;  

	session.subscribe("edu.cmu.ipd.users.onCreatedUser", onCreatedUser).then(
		function (sub) {
			console.log('subscribed to topic');
			subscribeHandler = sub;
		},
		function (err) {
			console.log('failed to subscribe to topic', err);
		});

	document.getElementById('login').onclick = function() {
		username = document.getElementById('username').value;
		session.call('edu.cmu.ipd.users.createUser', [username]).then(
			function(res) {
				console.log('called with token: ' + res[0]);
				userToken = res[0];
				onCreatedUser([]);
			},
			function(err) {
				console.log('error:', err.error, err.args, err.kwargs);
			});
	}

	document.getElementById('login').disabled = false;

	session.subscribe("edu.cmu.ipd.rounds.newRound", onDisplayOptions).then(
		function (sub) {
			console.log('subscribed to topic');
		},
		function (err) {
			console.log('failed to subscribe to topic', err);
		});

}

/*
 * createUser is a closure of session.
 * return 	: a RPC call that for registration call, 
 */
var onCreatedUser = function(args) {

	if (args.length === 2) {
		console.log('[device].onCreatedUser: receive pubsub username: ' + args[1] +  ' appliedToken:' + args[0]);
		cachedUserName.push(args[1]);
		cachedToken.push(args[0]);
	} else {
		console.log('[device].onCreatedUser: receive userToken: ' + userToken);
	}

	var idx = checkToken(userToken); 

	if (idx > -1) {
		appliedUserName = cachedUserName[idx];

		//Overwrite the header part
		addButton();

		var divAlert = document.createElement('div');
		divAlert.className = 'alert alert-success';
		divAlert.setAttribute('style', 'margin-top:1.5em');

		var aHref = document.createElement('a');
		aHref.setAttribute('href', '#');
		aHref.className = 'close';
		aHref.setAttribute('data-dismiss', 'alert'),
		aHref.innerHTML = '&times;';

		var strongTag =  document.createElement('strong');
		strongTag.innerHTML = 'Success!';

		divAlert.appendChild(aHref);
		divAlert.appendChild(strongTag);
		divAlert.innerHTML = divAlert.innerHTML + '  Your user name is ' + appliedUserName
		document.getElementById('demo_body').appendChild(divAlert);

		sessionHandler.unsubscribe(subscribeHandler).then(
			function(res) {
				console.log('unsubscribe .users.onCreatedUser');
			},
			function(err) {
				console.log('failed to unsubscribe .users.onCreatedUser');
			});

		setTimeout(function() {
			document.getElementById('demo_body').removeChild(divAlert);
		}, 5000);

	  sessionHandler.call('edu.cmu.ipd.rounds.currentRound', []).then(onDisplayOptions, 
		 function(err) {
			console.log('[device]\tFailed to call .rounds.currentRound.');
		 });
   }
		
}


var checkToken = function() {
	console.log('[device].checkToken: start check');
	for(i = 0; i < cachedToken.length; i++) {
		console.log('[device].checkToken: userToken=' + userToken + ' cachedToken[' + i + ']=' + cachedToken[i]);
		if (userToken === cachedToken[i]) {
			return i;
		}
	}
	return -1;
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

var addButton = function() {
	var divField = document.createElement('div');
	divField.id = 'field';
	var divUserName = document.createElement('div');
	divUserName.id = 'user_name';
	divUserName.innerHTML = 'Player: ' + shortenDisplayName(appliedUserName);

	var divScore = document.createElement('div');
	divScore.id = 'score';
	divScore.innerHTML = 'Score: ' + score;
	divField.appendChild(divUserName);
	divField.appendChild(divScore);

	var divDemoTitle = document.getElementById('demo_title');
	divDemoTitle.appendChild(divField);

	//Overwrite the button
	var buttonA = document.createElement('button');
	buttonA.disabled = true;
	buttonA.id = 'A';
	buttonA.innerHTML = 'Loading';

	var buttonB = document.createElement('button');
	buttonB.disabled = true;
	buttonB.id = 'B';
	buttonB.innerHTML = 'Loading';

	var parts = document.getElementsByClassName('part');
	var partA = parts[0];
	var partB = parts[1];
	partA.removeChild(partA.children[0]);
	partB.removeChild(partB.children[0]);
	partA.appendChild(buttonA);
	partB.appendChild(buttonB);

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
			param.push('Submit ' + buttonA.innerHTML);
		} else {
			param.push('Change to ' + buttonA.innerHTML)
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
		console.log("answer submitted: " + buttonB.innerHTML);

		param = [];
		param.push(appliedUserName);
		if (answerSubmitted === null) {
			param.push('Submit ' + buttonB.innerHTML);
		} else {
			param.push('Change to ' + buttonB.innerHTML)
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
