
var player;

function loadPlayer() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    playerVars: { 'controls': 0 },
    // videoId: 'Atds2P1cPwM',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerStateChange(event) {
  console.log("event: " + event.data);
  if (event.data == YT.PlayerState.ENDED) {
    session.call('edu.cmu.ipd.question.next',[]).then(function(res) {
      console.log(res);
    });
  }
}