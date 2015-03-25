// var autobahn = require('autobahn');

var connection = new autobahn.Connection({
    url: 'ws://ec2-54-183-65-200.us-west-1.compute.amazonaws.com:8080/ws',
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
var bundle = null;

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

    session.subscribe("edu.cmu.ipd.rounds.newRound", showAnswer);
}

function showQuestion(args) {
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
    console.log('showing question');
    setTimeout(function() {
        coundownID = setInterval(startCountdown(), 1000);
    }, 8000);

}

var startCountdown = function(countdownID) {
    
    var g_iCount = 6;
    
    return function() {
        if((g_iCount - 1) >= 0){
           g_iCount = g_iCount - 1;
           document.getElementById("numberCountdown").innerHTML = g_iCount;
        }   
    }
};

function stopCountdown() {
    clearInterval(coundownID);
    document.getElementById("numberCountdown").innerHTML = "";
}

var showAnswer = function(args) {
        console.log('show answer');
    if (bundle === null) {
        console.log('No previous bundle, waiting 5 secs before showing the question');
        setTimeout(showQuestion, 5000, args); 
        //showQuestion(args);
    } else {
        stopCountdown();
        info1_str = bundle.options[0].name+" has "+bundle.statistics[0]+" "+bundle.place_type;
        info1.setMap(null);
        info1 = new google.maps.InfoWindow({
            content: info1_str
        });
        info2_str = bundle.options[1].name+" has "+bundle.statistics[1]+" "+bundle.place_type;
        info2.setMap(null);
        info2 = new google.maps.InfoWindow({
            content: info2_str
        });
        info1.open(map, marker1);
        info2.open(map, marker2);

        document.getElementById("question").innerHTML = "The winner is "+bundle.answer+" !!!";
        
        console.log('previous answer shown, waiting 5 secs before showing the question');
        setTimeout(showQuestion, 5000, args); 
        //showQuestion(args);
    }

}

connection.open();
