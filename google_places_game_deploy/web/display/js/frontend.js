// var autobahn = require('autobahn');

var connection = new autobahn.Connection({
    url: 'ws://127.0.0.1:80/ws',
    realm: 'realm1'
})

var map;
var city1 = "Beijing";
var city2 = "New York";
var loc1  = new google.maps.LatLng(39.9388, 116.3974); // Beijing
var loc2  = new google.maps.LatLng(40.7033, -73.9796); // New York

var marker1 = null;
var marker2 = null;
var info1;
var info2;
var place_type;

var coundownID;

connection.onopen = function(session) {
    var location = new google.maps.LatLng(40, 0);
    // MAP
    var mapOptions = {
        center: location,
        zoom: 2
    }

    // Show the map HTML
    map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

    // Add Count Down div, dynamically
    var divCountdownClock = document.createElement('div');
    divCountdownClock.id = 'Countdown_clock';

    var spanNumberCountdown = document.createElement('span');
    spanNumberCountdown.id = 'numberCountdown';
    divCountdownClock.appendChild(spanNumberCountdown);

    var divMapCanvas = document.getElementById('Game_Body');
    divMapCanvas.insertBefore(divCountdownClock, divMapCanvas.childNodes[2]);

    reqQA(session);
}

var bundle = null;

function reqQA(session) {
    
    session.subscribe("edu.cmu.ipd.rounds.newRound", showQuesion);

}

var showQuesion = function (args) {
    bundle = args[0];
    //var answer = args[1];

    var place_type = bundle.place_type;
    var city1 = bundle.options[0];
    var city2 = bundle.options[1];

    var loc1  = new google.maps.LatLng(city1.lat, city1.lng); 
    var loc2  = new google.maps.LatLng(city2.lat, city2.lng); 
    
    if (marker1 !== null) {
        console.log('dismiss marker1 called');
        marker1.setMap(null);
        maker1 = null;
    }

    if (marker2 !== null) {
        console.log('dismiss marker2 called');
        marker2.setMap(null);
    }

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

    setTimeout(function() {
        coundownID = setInterval(startCountdown, 1000);
    }, 13000);
    setTimeout(stopCountdown(coundownID), 20000);

}

// var showAnswer = function(session) {
//     console.log('showAnswer');
//     setTimeout(reqQA, 5000, session);
// };

var g_iCount = 6;
var startCountdown = function() {
    if((g_iCount - 1) >= 0){
       g_iCount = g_iCount - 1;
       document.getElementById("numberCountdown").innerHTML = g_iCount;
       // setTimeout('startCountdown()',1000);
    }   
};

var stopCountdown = function(coundownID) {
    return function() {
        clearInterval(coundownID);
        document.getElementById("numberCountdown").innerHTML = "";
    }
}

connection.open();

/*
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
*/
