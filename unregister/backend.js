var autobahn = require('autobahn');

var connection = new autobahn.Connection({
	url: 'ws://127.0.0.1:8080/ws',
	realm: 'realm1'
})


connection.onopen = function(session){

	console.log("backend connected.");

	var handler = {
		session: session,
	}

	var question = {
		seq: 1,
		question: 'Hello world!',
		options: ["Yes", "No"], 

	}

	var helloWorld = (function(handler) {

		var innerCounter = 0;
		var innerHandler = handler;

		return function() {
			innerCounter = innerCounter + 1;
			console.log("hello: " + innerCounter);
			if (innerCounter >= 10) {
				innerHandler.session.unregister(innerHandler.reg).then(
					function() {
						console.log("successfully unregister.");
					},
					function(err) {
						console.log("failed to unregister.");
					});
			}
		}

	})(handler);

	session.register('edu.cmu.ipd.hello', helloWorld).then(
	   function (registration) {
	      handler.reg = registration;
	   }
	);
}

connection.open();