// var autobahn = require('autobahn');

var connection = new autobahn.Connection({
    url: 'ws://' + location.host + '/ws',
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
var info1_ans;
var info2;
var info2_ans;
var place_type;
var bundle = null;

var coundownID;

var sessionHandler;

var updatesCounter = 0;

connection.onopen = function(session) {
    sessionHandler = session;
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

    session.subscribe('edu.cmu.ipd.leaderboard.request', onLeaderBoardReady);

    session.subscribe('edu.cmu.ipd.updates.newUpdate', update);


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

    // InfoWindow for city1
    city1_contentStr = '<div id="city1_Infowindow" class="infowindow">' +
    '<span id="city1_InfowindowText" style="font-size: 2em;">'
    + city1.name +
    '</span>' +
    '<div>';
   
    // InfoWindow for city2
    city2_contentStr = '<div id="city2_Infowindow" class="infowindow">' +
    '<span id="city2_InfowindowText" style="font-size: 2em;">'
    + city2.name +
    '</span>' +
    '<div>';

    info1 = new google.maps.InfoWindow({
        content: city1_contentStr
    });
    info2 = new google.maps.InfoWindow({
        content: city2_contentStr
    });
    
    marker1.setMap(map);
    marker2.setMap(map);

    info1.open(map, marker1);
    info2.open(map, marker2);

    document.getElementById("question").innerHTML = 'Which place has more '+ place_type +'s ' +city1.name+ ' or ' +city2.name+ '?';
    console.log('showing question');

   sessionHandler.call('edu.cmu.ipd.leaderboard.request', [5]);

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
        // info1_str = bundle.options[0].name+" has "+bundle.statistics[0]+" "+bundle.place_type;
        document.getElementById("city1_InfowindowText").innerHTML = bundle.options[0].name+" has "+bundle.statistics[0]+" "+bundle.place_type;
        // info1.setMap(null); // Delete the old one
        // info1_ans = new google.maps.InfoWindow({ 
        //     content: city1_contentStr
        // });
        // info2_str = bundle.options[1].name+" has "+bundle.statistics[1]+" "+bundle.place_type;
        document.getElementById("city2_InfowindowText").innerHTML = bundle.options[1].name+" has "+bundle.statistics[1]+" "+bundle.place_type;
        // info2.setMap(null);
        // info2 = new google.maps.InfoWindow({
        //     content: city2_contentStr
        // });
        // info1_ans.open(map, marker1);
        // info2.open(map, marker2);

        document.getElementById("question").innerHTML = "The winner is "+bundle.answer+" !!!";
        
        console.log('previous answer shown, waiting 5 secs before showing the question');
        setTimeout(showQuestion, 5000, args); 
        //showQuestion(args);
    }

}

onLeaderBoardReady = function(args) {

    console.log(args);

    document.getElementById('top_1_name').innerHTML = args[0].userName;
    document.getElementById('top_1_score').innerHTML = args[0].score;

    document.getElementById('top_2_name').innerHTML = args[1].userName;
    document.getElementById('top_2_score').innerHTML = args[1].score;

    document.getElementById('top_3_name').innerHTML = args[2].userName;
    document.getElementById('top_3_score').innerHTML = args[2].score;

    document.getElementById('top_4_name').innerHTML = args[3].userName;
    document.getElementById('top_4_score').innerHTML = args[3].score;

    document.getElementById('top_5_name').innerHTML = args[4].userName;
    document.getElementById('top_5_score').innerHTML = args[4].score;
}

connection.open();


$(document).ready(function() {
    $('.flipper').addClass('flipperStart');
    setInterval(flip, 15 * 1000);
});

var flip = function() {
    var front = false;
    return function() {
        if (front === true) {
            $('.flipper').css('transform', 'rotateY(180deg)');
        } else {
            $('.flipper').css('transform', 'rotateY(0deg)');
        }
        front = !front;
    }
}();

var update = function(args) {
    
    console.log('receive update', args);    
    for(idx in args) {
        record = args[idx];
        while (updatesCounter >= 8) {
            $("#updates").find("tr").first().fadeOut(500, function(){$(this).remove()});
            updatesCounter--;
            console.log('updatesCounter decrement to:' + updatesCounter);
        }
        $("#updates").append("<tr style=\"display:none;\"><td>" + record.userName + "</td><td>" + record.action + "</td></tr>")
            .find("tr").last().fadeIn(500);
        updatesCounter++;
        console.log('updatesCounter increment to:' + updatesCounter);
    }
};