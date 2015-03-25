//Put the backend js file here
var autobahn = require('autobahn');

var when = require('when');

var connection = new autobahn.Connection({
	url: 'ws://ec2-54-183-65-200.us-west-1.compute.amazonaws.com:8080/ws',
	realm: 'realm1'
});

connection.onopen = function(session){

	console.log('node connected.');

	session.subscribe("edu.cmu.ipd.users.onCreatedUser", onCreatedUser).then(
      function (sub) {
         console.log('subscribed to topic');
      },
      function (err) {
         console.log('failed to subscribe to topic', err);
      }
   	);

   	session.call('edu.cmu.ipd.users.createUser', ['Jeremy']).then(
   		function(res) {
   			console.log('called')
   		},
   		function(err) {
   			console.log('error:', err.error, err.args, err.kwargs);
   		});

}

/*
 * createUser is a closure of session.
 * return 	: a RPC call that for registration call, 
 */
var onCreatedUser = function(args) {
	console.log('[client] onCreatedUser: applied username: ' + args[0]);
}

connection.open();
