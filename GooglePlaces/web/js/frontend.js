// var autobahn = require('autobahn');

var connection = new autobahn.Connection({
	url: 'ws://127.0.0.1:8080/ws',
	realm: 'realm1'
})

var map_left;
var city_left;
var map_right;
var city_right;
var place_type = "bar";

connection.onopen = function(session) {

	console.log("frontend connected. Excellent");

    // MAP_LEFT
    // Specify an intial location
    city_left = "Mountain View";
    var location_left = new google.maps.LatLng(37.3944, -122.0759); // Mountain View
    var mapOptions_left = {
        center: location_left,
        zoom: 15
    };

    // Show the map and header on HTML
    map_left = new google.maps.Map(document.getElementById('map-canvas-left'),
        mapOptions_left);
    document.getElementById('city-left').innerHTML = city_left;

    // A search request for PlacesService.nearbySearch
    var request_left = {
        location: location_left,
        radius: 1000, // In meters, 1 kilometer
        types: [place_type] // Types of place to search
    }
    // Run the request
    var svrs_left = new google.maps.places.PlacesService(map_left);
    svrs_left.nearbySearch(request_left, callback_left);

    // MAP_RIGHT
    // Specify an intial location
    city_right = "Palo Alto";
    var location_right = new google.maps.LatLng(37.4292, -122.1381); // Palo Alto
    var mapOptions_right = {
        center: location_right,
        zoom: 15
    };

    // Show the map and header on HTML
    map_right = new google.maps.Map(document.getElementById('map-canvas-right'),
        mapOptions_right);
    document.getElementById('city-right').innerHTML = city_right;

    // A search request for PlacesService.nearbySearch
    var request_right = {
        location: location_right,
        radius: 1000, // In meters, 1 kilometer
        types: [place_type] // Types of place to search
    }
    // Run the request
    var svrs_right = new google.maps.places.PlacesService(map_right);
    svrs_right.nearbySearch(request_right, callback_right);

	var question;

	/* Subscribe to .questions channel. This message is published
	   when a new round of game starts. */
	var onNewQuestion = function(args) {
		question       = args[0];
		ansOptsCounter = args[1];
		console.log(question.question);
		document.getElementById("questionText").innerHTML = question.question;
		document.getElementById("questionText").setAttribute("seqno",question.seq);
		document.getElementById("choiceTextA").innerHTML = question.options[0];
		document.getElementById("choiceTextB").innerHTML = question.options[1];
		document.getElementById("choiceTextC").innerHTML = question.options[2];

		document.getElementById("pollsA").value = ansOptsCounter[0];
		document.getElementById("pollsB").value = ansOptsCounter[1];
		document.getElementById("pollsC").value = ansOptsCounter[2];
	}

	session.subscribe("edu.cmu.ipd.questions", onNewQuestion).then(
      function (sub) {
         console.log('subscribed to .questions');
      },
      function (err) {
         console.log('failed to subscribe to .questions', err);
      });

	/* Subscribe to .onvote channel. This message is published
	   when any client submit an answer */
	var onNewVote = function(args) {
		
		var update = args[0];
		var opt = update.optSEQ === 0 ? 'A' : (update.optSEQ === 1 ? 'B' : 'C');
		document.getElementById("polls" + opt).value = update.value;
	}

	session.subscribe("edu.cmu.ipd.onvote", onNewVote).then(
		function(sub) {
			console.log("subscribe to .onvote");
		},
		function(err) {
			console.log("fail to subscribe to .onvote");
		});



	/* Add oncClick listener to each button. Once a choice is clicked, it call RPC to backend */
	
	var formAnswer = function(qSEQ, optNum) {
		var answer = {
			qSEQ: qSEQ,
			opt: optNum, 
		}
		return answer;
	}

	var submitAnswer = function(answer) {
		session.call('edu.cmu.ipd.onpoll', [answer]).then(
			function (res) {
				console.log("successfully submit answer");
			}
		);
	}

	var choiceButtons = document.getElementById("pollContainer").
		getElementsByTagName("button");
	
	for (var i = 0; i < choiceButtons.length; i++) {
		choiceButtons[i].onclick = function(evt) {
			var qSEQ = document.getElementById("questionText").getAttribute("seqno");
			var choiceId = evt.target.id;
			var optNum = choiceId === "A" ? 0 : (choiceId === "B" ? 1 : 2);
			var ans = formAnswer(qSEQ, optNum);
			submitAnswer(ans);
			console.log("target.id: " + optNum + "/" + choiceId + "   Q#:" + qSEQ);
		}
	}

	/* Retrieve the current question. This is only called only once upon loading the page */
	session.call("edu.cmu.ipd.loadquestion", [0]).then(
		function(res) {
			onNewQuestion(res);
		});
}

// result is of type <google.maps.places.PlaceResult>
// A callback function for nearbySearch
function callback_left(res, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < res.length; i++) {
            createMarker_left(res[i]);
        }
    }
}
// Create the location marker for each place.
function createMarker_left(place) {
    var loc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map_left,
        position: loc
    });
}

function callback_right(res, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < res.length; i++) {
            createMarker_right(res[i]);
        }
    }
}
function createMarker_right(place) {
    var loc = place.geometry.location;
    var marker = new google.maps.Marker({
        map: map_right,
        position: loc
    });
}

connection.open();
