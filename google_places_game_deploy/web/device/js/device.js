var connection = new autobahn.Connection({
	url: 'ws://ec2-54-183-65-200.us-west-1.compute.amazonaws.com:8080/ws',
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
      }
   );

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
      }
   );
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
         divAlert.innerHTML = divAlert.innerHTML + '  The correct answer is ' + answerLastRound;
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

   // City names to display on buttons
   var cities = args[0].options; 
   var city1;
   var city2;

   // Answer
   answerLastRound = args[0].answer;

   if (cities.length === 2 ){
      
      city1 = cities[0].name;
      city2 = cities[1].name;
   
   document.getElementById("A").innerHTML = city1;
   document.getElementById('A').style.backgroundColor = '#D4D0C8';

   document.getElementById("B").innerHTML = city2;
   document.getElementById('B').style.backgroundColor = '#D4D0C8';

   }
} // end onDisplayOptions

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
   buttonA.id = 'A';
   buttonA.innerHTML = 'Loading';

   var buttonB = document.createElement('button');
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
      answerSubmitted = buttonA.innerHTML;
      document.getElementById('A').style.backgroundColor = 'rgb(196, 88, 173)';
      document.getElementById('B').style.backgroundColor = '#D4D0C8';
      console.log("answer submitted: " + buttonA.innerHTML);
   }
   document.getElementById("B").onclick = function (event) {
      answerSubmitted = buttonB.innerHTML;
      document.getElementById('B').style.backgroundColor = 'rgb(196, 88, 173)';
      document.getElementById('A').style.backgroundColor = '#D4D0C8';
      console.log("answer submitted: " + buttonB.innerHTML);
   }
}

connection.open();
