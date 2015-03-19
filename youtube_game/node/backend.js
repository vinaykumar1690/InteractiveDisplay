var autobahn = require('autobahn');
var youtube   = require('./youtube.client.js')

var connection = new autobahn.Connection({
	url: 'ws://127.0.0.1:80/ws',
	realm: 'realm1'
})



connection.onopen = function(session){

	console.log("backend connected.");
	
	youtube.authenticate(function() {
		var nextQuestion = function() {
			console.log("nextQuesion is called");
			return youtube.playVideo(sendBackValue);
		}
		session.register("edu.cmu.ipd.question.next", nextQuestion).then(
			function(reg) {
				console.log("question.next registered.");
			},
			function(err) {
				console.log("question.next registered failed: " + err);
			});
	});

	function sendBackValue(response) {
		session.publish('edu.cmu.ipd.video.next', [response]);
		session.publish('edu.cmu.ipd.device.choice.next', [response]);
	}

	function retrieveBundle() {
		return youtube.bundle;
	}
	
	session.register('edu.cmu.ipd.device.bundle', retrieveBundle).then(
		function(response) {
			console.log('device.bundle registered');
		},
		function(err) {
			console.log('device.bundle failed to register: ' + err);
		});
}

connection.open();