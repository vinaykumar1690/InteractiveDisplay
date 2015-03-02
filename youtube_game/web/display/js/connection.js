// var autobahn = require('autobahn');

var connection = new autobahn.Connection({
	url: 'ws://127.0.0.1:8080/ws',
	realm: 'realm1'
})

var currBundle;

connection.onopen = function(sessions){

	console.log("display connected.");

	var onNextVideo = function(ret) {
		console.log('onNextVideo:' + ret[0].videoID);
		player.loadVideoById(ret[0].videoID, 0, 'default');
		document.getElementById("questionText").innerHTML = ret[0].question;
		// document.getElementById("questionText").setAttribute("seqno",question.seq);
		currBundle = ret;
	}

	sessions.subscribe('edu.cmu.ipd.video.next', onNextVideo).then(
		function(res) {
			console.log('video.next subscribes');
		},
		function(err) {
			console.log('video.next subscribes failed: ' + err);
		}
	);

	onConnectionOpen(sessions);

}
