// The client ID is obtained from the Google Developers Console
// at https://console.developers.google.com/.
// If you run this code from a server other than http://localhost,
// you need to register your own client ID.
var clientId = '51339481910-09hp4n80hl03iioshpar084qbie101fk.apps.googleusercontent.com';

var apiKey = 'AIzaSyBv8Qjzf4KPVqu8Xk88SWYoGqJJ97cy8J0';

var scopes = [
  'https://www.googleapis.com/auth/youtube'
];


// Upon loading, the Google APIs JS client automatically invokes this callback.
googleApiClientReady = function() {
  gapi.client.setApiKey(apiKey);
  window.setTimeout(checkAuth, 1);
}

// Attempt the immediate OAuth 2.0 client flow as soon as the page loads.
// If the currently logged-in Google Account has previously authorized
// the client specified as the OAUTH2_CLIENT_ID, then the authorization
// succeeds with no user intervention. Otherwise, it fails and the
// user interface that prompts for authorization needs to display.
function checkAuth() {
  gapi.auth.authorize({
    client_id: clientId,
    scope: scopes,
    immediate: true
  }, handleAuthResult);
}

// Handle the result of a gapi.auth.authorize() call.
function handleAuthResult(authResult) {
  
  if (authResult && !authResult.error) {
    // Authorization was successful. Hide authorization prompts and show
    // content that should be visible after authorization succeeds.
    $('.pre-auth').hide();
    $('.post-auth').show();
    loadAPIClientInterfaces();
  } else {
    // Make the #login-link clickable. Attempt a non-immediate OAuth 2.0
    // client flow. The current function is called when that flow completes.
    console.log("handleAuthResult-else is called");
    $('#login-link').click(function() {
      gapi.auth.authorize({
        client_id: clientId,
        scope: scopes,
        immediate: false
        }, handleAuthResult);
    });
  }
}

// Load the client interfaces for the YouTube Analytics and Data APIs, which
// are required to use the Google APIs JS client. More info is available at
// http://code.google.com/p/google-api-javascript-client/wiki/GettingStarted#Loading_the_Clien

function loadAPIClientInterfaces() {
  console.log("loadAPIClientInterfaces is called");
  gapi.client.load('youtube', 'v3').then(function() {
    handleAPILoaded();
  });
}
