// JavaScript source code
//https://developers.google.com/maps/documentation/javascript/examples/place-search

var map_left;
var city_left;

var map_right;
var city_right;


var infowindow;

function initialize() {

    /////////// MAP_LEFT
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

    var request_left = {
        location: location_left,
        radius: 1000, // In meters, 1 kilometer
        types: ['bar']
    }

    var svrs_left = new google.maps.places.PlacesService(map_left);
    svrs_left.nearbySearch(request_left, callback_left);

    /////////// MAP_RIGHT
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

    var request_right = {
        location: location_right,
        radius: 1000, // In meters, 1 kilometer
        types: ['bar']
    }

    var svrs_right = new google.maps.places.PlacesService(map_right);
    svrs_right.nearbySearch(request_right, callback_right);


    infowindow = new google.maps.InfoWindow();

}

// result is of type <google.maps.places.PlaceResult>
function callback_left(res, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < res.length; i++) {
            createMarker_left(res[i]);
        }
    }
}
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

//function createMarker(place) {
//    var loc = place.geometry.location;
//    var marker = new google.maps.Marker({
//        map: currentmap,
//        position: loc
//    });

//google.maps.event.addListener(marker, 'click', setInfo);

//var content = "<b>Name</b>:" + place.name +
//                "<br><b>Rating</b>:" + place.rating;

//function setInfo() {
//    infowindow.setContent(content);
//    infowindow.open(map_left, this);
//};

google.maps.event.addDomListener(window, 'load', initialize);