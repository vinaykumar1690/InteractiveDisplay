var connection = new autobahn.Connection({
	url: 'ws://' + location.host + '/ws',
	realm: 'realm1'
});

document.getElementById('login').disabled = true;

var sessionHandler;

var userToken;
var appliedUserName;

var subscribeHandler;
// var answerSubmitted = null;
// var answerLastRound = null;

// var score = 0;

var cachedUserName = [];
var cachedToken    = [];



connection.onopen = function(session){

	sessionHandler = session;  

	session.subscribe("edu.cmu.ipd.users.onCreatedUser", onCreatedUser).then(
		function (sub) {
			console.log('[login]subscribed to topic .users.onCreatedUser');
			subscribeHandler = sub;
		},
		function (err) {
			console.log('failed to subscribe to topic', err);
		});

	document.getElementById('login').onclick = function() {
		username = document.getElementById('username').value;
		console.log('username: ' + username);
		session.call('edu.cmu.ipd.users.createUser', [username]).then(
			function(res) {
				console.log('[login]called with token: ' + res[0]);
				userToken = res[0];
				onCreatedUser([]);
			},
			function(err) {
				console.log('[login]error:', err.error, err.args, err.kwargs);
			});
	}

	document.getElementById('login').disabled = false;

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
			window.location="http://" + location.host + "/device/index.html" + "?username=" + appliedUserName;
		}, 5000);


	  // sessionHandler.call('edu.cmu.ipd.rounds.currentRound', []).then(onDisplayOptions, 
		 // function(err) {
			// console.log('[device]\tFailed to call .rounds.currentRound.');
		 // });
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

connection.open();
