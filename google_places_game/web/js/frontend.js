// var autobahn = require('autobahn');

var connection = new autobahn.Connection({
	url: 'ws://127.0.0.1:8080/ws',
	realm: 'realm1'
})

var city_left = "Beijing";
var city_right = "New York";
var location_left = new google.maps.LatLng(39.9053, 116.3709); // Mountain View
var location_right = new google.maps.LatLng(40.7033, -73.9796); // Palo Alto
var map_left;
var map_right;
var left_res = 0;
var right_res = 0;
var left_done = false;
var right_done = false;
var place_type = "bar";
var marker_right = [];
var marker_left = [];

connection.onopen = function(session) {

	console.log("frontend connected.");

    // MAP_LEFT
    var mapOptions_left = {
        center: location_left,
        zoom: 15
    };

    // Show the map and header on HTML
    map_left = new google.maps.Map(document.getElementById('map-canvas-left'),
        mapOptions_left);
    document.getElementById('city-left').innerHTML = city_left;

    // MAP_RIGHT
    var mapOptions_right = {
        center: location_right,
        zoom: 15
    };

    // Show the map and header on HTML
    map_right = new google.maps.Map(document.getElementById('map-canvas-right'),
        mapOptions_right);
    document.getElementById('city-right').innerHTML = city_right;

    function requestResult() {

        // A search request for PlacesService.nearbySearch
        var request_left = {
          location: location_left,
          radius: 1000, // In meters, 1 kilometer
          types: [place_type] // Types of place to search
        }
        // Run the request
        var svrs_left = new google.maps.places.PlacesService(map_left);
        svrs_left.nearbySearch(request_left, callback_left);

        // A search request for PlacesService.nearbySearch
        var request_right = {
          location: location_right,
          radius: 1000, // In meters, 1 kilometer
          types: [place_type] // Types of place to search
        }
        // Run the request
        var svrs_right = new google.maps.places.PlacesService(map_right);
        svrs_right.nearbySearch(request_right, callback_right);

    }

    function requestQuestion() {
        session.publish('edu.cmu.ipd.reqQuestion', []);
        console.log('requested for a new question');
        /* delete all markers in the map */
        for (var i = 0; i < marker_left.length; i++) {
            marker_left[i].setMap(null);
        }
        for (var i = 0; i < marker_right.length; i++) {
            marker_right[i].setMap(null);
        }
    }

    function sendResult() {
        if (left_done && right_done) {
            var winner = "";
            if (left_res >= right_res)
                winner = city_left;
            else
                winner = city_right;
            session.publish('edu.cmu.ipd.winner', [winner]);

            document.getElementById("question").innerHTML = winner+ ' has more ' +place_type+ '!!';
            document.getElementById('city-left').innerHTML = city_left+ ' : ' +left_res;
            document.getElementById('city-right').innerHTML = city_right+ ' : ' +right_res;

            left_res = 0;
            right_res = 0;
            left_done = false;
            right_done = false;
            setTimeout(requestQuestion, 5000);
        } else {
            console.log('Waiting for both results.');
        }
    }

    // result is of type <google.maps.places.PlaceResult>
    // A callback function for nearbySearch
    function callback_left(res, status) {
        left_res = res.length;
        left_done = true;
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < res.length; i++) {
                createMarker_left(res[i]);
            }
        }
        sendResult();
    }

    // Create the location marker for each place.
    function createMarker_left(place) {
        var loc = place.geometry.location;
        var marker = new google.maps.Marker({
            map: map_left,
            position: loc
        });
        marker_left.push(marker);
    }

    function callback_right(res, status) {
        right_res = res.length;
        right_done = true;
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < res.length; i++) {
                createMarker_right(res[i]);
            }
        }
        sendResult();
    }

    function createMarker_right(place) {
        var loc = place.geometry.location;
        var marker = new google.maps.Marker({
            map: map_right,
            position: loc
        });
        marker_right.push(marker);
    }

    session.subscribe("edu.cmu.ipd.types", onNewType).then(
      function (sub) {
         console.log('subscribed to .types');
      },
      function (err) {
         console.log('failed to subscribe to .types', err);
      });
    
    function onNewType(args) {
        place_type = args[0];
        document.getElementById("question").innerHTML = 'Which place has more <u>'+ place_type +'s</u>. <u>' +city_left+ '</u> or <u>' +city_right+ '</u>?';
        console.log('Updating place_type to ', place_type);
        setTimeout(requestResult, 15000);
        document.getElementById('city-left').innerHTML = city_left;
        document.getElementById('city-right').innerHTML = city_right;
    }

    /* Called only once to set the first question */
    onNewType([place_type]);

}

connection.open();
