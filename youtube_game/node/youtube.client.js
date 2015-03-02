var google = require('googleapis');

var youtube = google.youtube('v3');

var when = require('when');

var questions = ['What is the like counts of this trailer?', 'What is the duration of this trailer?'];

var playVideo;

var authClient = new google.auth.JWT(
    '51339481910-934rvd4br2per9v3lfglq5ikde63qafa@developer.gserviceaccount.com',
    '../credential/googleapi-privatekey.pem',
    // Contents of private_key.pem if you want to load the pem file yourself
    // (do not use the path parameter above if using this param)
    null,
    // Scopes can be specified either as an array or as a single, space-delimited string
    ['https://www.googleapis.com/auth/youtube'],
    // User to impersonate (leave empty if no impersonation needed)
    null);

exports.authenticate = function(callback) {
  authenticate().then(function(response) {
    console.log("authenticate returns");
    retrievePlayList().then(function(response) {
      console.log("retrievePlayList returns");
      exports.playVideo = createPlayList(response);
      callback();
    });
  });

  console.log("exports.authenticate returning");
}

function authenticate() {
  var deferred = when.defer();
  authClient.authorize(function(err, response) {
    if (err) {
      console.log(err);
      deferred.reject(err);
    } else {
      console.log("authentication succeeds.");
      deferred.resolve(response);
    }
  });
  return deferred.promise;

}

function retrievePlayList() {
  var deferred = when.defer();
  youtube.playlistItems.list({
    playlistId: 'PLN5GdLIouYnBKrhjHld3PIePWC6c9Eq2p',
    part: 'snippet',
    fields: 'items/snippet/resourceId/videoId',
    auth: authClient
  }, function(err, response) {
    if (err) {
      console.log("retrievePlayList.err: " + err);
      deferred.reject(err);
    } else {
      console.log("retrievePlayList succeeds");
      deferred.resolve(response);
    }
  });
  return deferred.promise;
}


function createPlayList(response) {
  console.log("createPlayList called");
  var counter = 0;
  var videoIds = [];
  for(i = 0; i < response.items.length; i++) {
    videoIds[i] = response.items[i].snippet.resourceId.videoId;
  }

  return function(callback) {
    var ret = [];
    var currQuesionID = counter  % questions.length;
    var currVideoId = videoIds[counter++ % videoIds.length];

    var retrieveVideoInfo =  function() {
      var deferred = when.defer();

      var param = getVideoRequestParam(currQuesionID, currVideoId);

      youtube.videos.list(param, function(err, response) {
        if (err) {
          console.log("retrieveVideoInfo.err: " + err);
          deferred.reject(err);
        } else {
          deferred.resolve(response);
        }
      });
      return deferred.promise;
    }

    retrieveVideoInfo().then(function(response) {
      var ret = parseVideoResponse(response, currVideoId, currQuesionID);
      exports.bundle = ret;
      callback(ret);
    }, function(err) {
      console.log(err);
    });

    return 'succeeds';
  }
}


function getVideoRequestParam(questionID, currVideoID) {
  var param = {
    id: currVideoID,
    auth: authClient
  }

  if (questionID === 0) {
    param.part = 'statistics';
    param.filed = 'items/statistics';  
  } else {
    param.part = 'contentDetails';
    param.filed = 'items/contentDetails/duration';
  }

  return param;
}

function parseVideoResponse(response, videoID, questionOffset) {
  var bundle = {};
  bundle.question = questions[questionOffset];
  bundle.videoID = videoID;
  console.log(response);
  if (questionOffset === 0) {
    var answer = response.items[0].statistics.likeCount
    bundle.answer = response.items[0].statistics.likeCount + ' likes';
    bundle.alternative = alternativeValue(answer) + ' likes';
  } else {
    var answer = convertDuration(response.items[0].contentDetails.duration);
    bundle.answer = answer + ' sec';
    bundle.alternative = alternativeValue(answer) + ' sec';
  }
  return bundle;
}


function convertDuration(duration) {
  var counter = 0;
  duration = duration.substring(2);
  comp = duration.split("M");
  if (comp.length === 2) {
    counter = comp[0] * 60;
    comp = comp[1].split("S");
    counter += comp[0] * 1;
    return counter;
  } else {
    return comp[0].split("S")[0] * 1;
  } 
}

function alternativeValue(duration) {
  console.log('alternativeValue: from ' + duration + ' to ' + Math.floor(Math.floor((Math.random()*duration*2/3) + 1) + (duration/2)));
  return Math.floor(Math.floor((Math.random()*duration*2/3) + 1) + (duration/2));
}
