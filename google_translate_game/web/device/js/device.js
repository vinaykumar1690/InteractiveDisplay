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

var onDialog;

var sessionHandler;


connection.onopen = function(session){

	console.log('node connected.');

	sessionHandler = session;
	session.subscribe("edu.cmu.ipd.rounds.newRound", onDisplayOptions).then(
		function (sub) {
			console.log('subscribed to topic [.rounds.newRound]');
		},
		function (err) {
			console.log('failed to subscribe to topic', err);
		});

	addOnClick(session);

	// session.call('edu.cmu.ipd.rounds.currentRound', []).then(onDisplayOptions, 
	// 	 function(err) {
	// 		console.log('[device]\tFailed to call .rounds.currentRound.');
	// 	 });
	

    $("#dialog").dialog({
    	// show: { effect: "slideDown", duration:800 },
    	close: function() {
    		progressLoad();
    	}, 
    });
}



/*
 * Display the options on device UI.
 */
var onDisplayOptions = function(args) {

	console.log(args);

	if (args[0] === null) {
		return;
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

	progressCountDown();
	
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

var progressLoad = function() {

	$("#progressbar-5").progressbar({
		max: 26,
		value: false,
		change: function() {
			if ($("#progressbar-5").progressbar("value")) {
				$(".progress-label").text($("#progressbar-5").progressbar("value") + " sec");
			}
		},
		// complete: function() {
		// 	$(".progress-label").text("Submitting Your Answer!");
		// }
	});
	$(".progress-label").css('top', ($('.progress-background').offset().top)*1.01);
	$(".progress-label").text('Waiting for new round...');

	document.getElementById("A").disabled = true;
	document.getElementById("B").disabled = true;

}

var progressCountDown = function () {
	var val;
	if ($("#progressbar-5").progressbar("value") === false) {
		val = 27;
		$('.ui-progressbar-value.ui-widget-header.ui-corner-left').css('background', '#f6a828');
	} else {
		val = $("#progressbar-5").progressbar("value")
	}
	$("#progressbar-5").progressbar("value", val-1);
	
	if (val === 11) {
		$('.ui-progressbar-value.ui-widget-header.ui-corner-left').css('background', 'red');
	}
	if (val > 1) {
		setTimeout(progressCountDown, 1000);
	} else {
		$('.ui-progressbar-value.ui-widget-header.ui-corner-left').css('background', '#f6a828');
		$(".progress-label").text('Submitting Your Answer...');
		$("#progressbar-5").progressbar("value", false);

		document.getElementById("A").disabled = true;
		document.getElementById("B").disabled = true;


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
	}
};

connection.open();
$('#user_name').text("Player: " + shortenDisplayName(window.location.search.split('=')[1]));