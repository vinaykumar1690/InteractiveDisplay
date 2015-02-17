var autobahn = require('autobahn');

var connection = new autobahn.Connection({
	url: 'ws://127.0.0.1:8080/ws',
	realm: 'realm1'
})


connection.onopen = function(session){

	console.log("frontend connected.");

	t1 = setInterval(function () {
		session.call('edu.cmu.ipd.hello', []).then(
			function (res) {
				console.log('called');
			}
		);
   	}, 1000);
	
}

connection.open();