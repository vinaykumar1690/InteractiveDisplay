var connection = new autobahn.Connection({
	url: 'ws://127.0.0.1:80/ws',
	realm: 'realm1'
});

document.getElementById('login').disabled = true;

var sessionHandler;
var userToken;
var subscribeHandler;

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

}

/*
 * createUser is a closure of session.
 * return 	: a RPC call that for registration call, 
 */
var onCreatedUser = function(args) {
	
   console.log('[client] onCreatedUser: applied username: ' + args[1] +  ' appliedToken:' + args[0]);

   var appliedUserName = args[1];
   var appliedToken = args[0];

   if (userToken === appliedToken) {
      //Overwrite the header part
      var divField = document.createElement('div');
      divField.id = 'field';
      var divUserName = document.createElement('div');
      divUserName.id = 'user_name';
      divUserName.innerHTML = 'Player: ' + args[0];
      var divScore = document.createElement('div');
      divScore.id = 'score';
      divScore.innerHTML = 'Score: 0';
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

      sessionHandler.unsubscribe(subscribeHandler).then(
         function(res) {
            console.log('unsubscribe .users.onCreatedUser');
         },
         function(err) {
            console.log('failed to unsubscribe .users.onCreatedUser');
         });
   }
   


}



connection.open();