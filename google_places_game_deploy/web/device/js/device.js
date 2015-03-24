var connection = new autobahn.Connection({
	url: 'ws://10.0.17.206:80/ws',
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
	
   console.log('[client] onCreatedUser: applied username: ' + args[1] +  ' appliedToken:' + args[0]);

   appliedUserName = args[1];
   var appliedToken = args[0];

   if (userToken === appliedToken) {
      //Overwrite the header part
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
      buttonA.innerHTML = 'Choose';

      var buttonB = document.createElement('button');
      buttonB.id = 'B';
      buttonB.innerHTML = 'Choose';

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
         console.log("answer submitted: " + buttonA.innerHTML);
      }
      document.getElementById("B").onclick = function (event) {
         answerSubmitted = buttonB.innerHTML;
         console.log("answer submitted: " + buttonB.innerHTML);
      }

      sessionHandler.unsubscribe(subscribeHandler).then(
         function(res) {
            console.log('unsubscribe .users.onCreatedUser');
         },
         function(err) {
            console.log('failed to unsubscribe .users.onCreatedUser');
         });
   }
}

/*
 * Display the options on device UI.
 */
var onDisplayOptions = function(args) {

   if (answerSubmitted !== null && answerLastRound !== null) {
      if (answerSubmitted === answerLastRound){
         alert('Congratulations!')
         answerSubmitted = null;
         score += 10;
      } else {
         alert('Sorry. The correct answer is ' + answerLastRound);
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
   document.getElementById("B").innerHTML = city2;
   }
} // end onDisplayOptions

var shortenDisplayName = function(appliedUserName) {
   if (appliedUserName.length > 6) {
      return appliedUserName.substring(0, 6) + "...";
   } else {
      return appliedUserName
   }
}

connection.open();