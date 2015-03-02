 // 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var session;

function onYouTubeIframeAPIReady() {
	connection.open();
}

function onConnectionOpen(args) {
	session = args;
	loadPlayer();
}

function onPlayerReady() {
	console.log('player is ready');
	session.call('edu.cmu.ipd.question.next',[]).then(function(res) {
		// console.log(res);
	});
}

