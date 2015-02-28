 // 2. This code loads the IFrame Player API code asynchronously.
console.log("called");
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: 'Atds2P1cPwM',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  console.log("Player is ready.");
  event.target.playVideo();
}


// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;

function onPlayerStateChange(event) {
  console.log("event: " + event.data);
  if (event.data == YT.PlayerState.ENDED) {
    loadNewVideo();
  }
}

function loadNewVideo() {
  console.log("video ends");
  player.loadVideoById("6W_zwFCYg_8");
}