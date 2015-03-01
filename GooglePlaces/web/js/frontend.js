// var autobahn = require('autobahn');

var connection = new autobahn.Connection({
	url: 'ws://127.0.0.1:8080/ws',
	realm: 'realm1'
})

var city_left = "Mountain View";
var city_right = "Palo Alto";
var location_left = new google.maps.LatLng(37.3944, -122.0759); // Mountain View
var location_right = new google.maps.LatLng(37.4292, -122.1381); // Palo Alto
var map_left;
var map_right;
var place_type = "bar";

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

    session.subscribe("edu.cmu.ipd.types", onNewType).then(
      function (sub) {
         console.log('subscribed to .types');
      },
      function (err) {
         console.log('failed to subscribe to .types', err);
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

function onNewType(args) {
    place_type = args[0];
    document.getElementById("question").innerHTML = place_type;
}
connection.open();
