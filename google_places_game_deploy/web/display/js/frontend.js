//var autobahn = require('autobahn');

var connection = new autobahn.Connection({
    url: 'ws://127.0.0.1:80/ws',
    realm: 'realm1'
})

var map;
var city1 = "Beijing";
var city2 = "New York";
var loc1  = new google.maps.LatLng(39.9388, 116.3974); // Beijing
var loc2  = new google.maps.LatLng(40.7033, -73.9796); // New York

var marker1;
var marker2;
var info1;
var info2;
var place_type;

function initialize() {
    var location = new google.maps.LatLng(40, 0);

    // MAP
    var mapOptions = {
        center: location,
        zoom: 2
    }

    // Show the map HTML
    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

}

google.maps.event.addDomListener(window, 'load', initialize);

connection.onopen = function(session) {

    session.subscribe("edu.cmu.ipd.question", onNewQuestion).then(
        function (sub) {
            console.log('subscribed to .question');
        },
        function (err) {
            console.log('failed to subscribe to .question', err);
        });

    function onNewQuestion(args) {
    var question = args[0];
    var answer = args[1];

        var place_type = question.place_type;
        var city1 = question.city1;
        var city2 = question.city2;

        var loc1  = new google.maps.LatLng(city1.lat, city1.lng); 
        var loc2  = new google.maps.LatLng(city2.lat, city2.lng); 
        
        marker1 = new google.maps.Marker({
            position: loc1
        });
        marker2 = new google.maps.Marker({
            position: loc2
        });
        info1 = new google.maps.InfoWindow({
            content: city1.name
        });
        info2 = new google.maps.InfoWindow({
            content: city2.name
        });
        
        marker1.setMap(map);
        marker2.setMap(map);

        info1.open(map, marker1);
        info2.open(map, marker2);

        document.getElementById("question").innerHTML = 'Which place has more '+ place_type +'s ' +city1.name+ ' or ' +city2.name+ '?';

        function showAnswer() {
        document.getElementById("question").innerHTML = answer.city.name+ ' WINS!!';
        }

    setTimeout(showAnswer, 10000);
    }

    function testOnNewQuestion() {

    var result1;
    var result2;
        var res1_done = false;
        var res2_done = false;

        var city1 = {
            name: 'New York',
            lat: 40.7033,
            lng: -73.9796
        }
        var city2 = {
            name: 'Beijing',
            lat: 39.9388,
            lng: 116.3974
        }
        var question = {
            place_type: 'bar',
            city1: city1,
            city2: city2
        }

    // A search request for PlacesService.nearbySearch
    var request1 = {
      location: new google.maps.LatLng(city1.lat, city1.lng),
      radius: 1000, // In meters, 1 kilometer
      types: [place_type] // Types of place to search
    }
    // Run the request
    var svrs1 = new google.maps.places.PlacesService(map);
    svrs1.nearbySearch(request1, callback1);

    // result is of type <google.maps.places.PlaceResult>
    // A callback function for nearbySearch
    function callback1(res, status) {
        res1_done = true;
        result1 = res;
    }

     // A search request for PlacesService.nearbySearch
    var request2 = {
      location: new google.maps.LatLng(city2.lat, city2.lng),
      radius: 1000, // In meters, 1 kilometer
      types: [place_type] // Types of place to search
    }
    // Run the request
    var svrs2 = new google.maps.places.PlacesService(map);
    svrs2.nearbySearch(request1, callback2);

    // result is of type <google.maps.places.PlaceResult>
    // A callback function for nearbySearch
    function callback2(res, status) {
        res2_done = true;
        result2 = res;

    }

    while (res1_done && res2_done);
    res1_done = false;
    res2_done = false;

            if (result1.length > result2.length) {
            answer = {
                markers: result1,
                city: city1
            }
        } else {
            answer = {
                markers: result2,
                city: city2
            }
        } 
            onNewQuestion([question, answer]);
    
    }

    setTimeout(testOnNewQuestion, 10000);

}

connection.open();