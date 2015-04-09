var connection = new autobahn.Connection({
    url: 'ws://' + location.host + '/ws',
    realm: 'realm1'
})

var lineSymbol = {
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
};

var markers_1 = [];
var markers_2 = [];

var infos = [{},{}];

var map;
var countdownID = null;
var gbundle = null;
var drawPath1 = null;
var drawPath2 = null;
var lines1 = [];
var lines2 = [];

var sessionHandler = null;
var updatesCounter = 0;

// function initialize() {
connection.onopen = function(session) {

    sessionHandler = session;

    console.log('connection opened');
    var image = {
        url: '',
        // size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(0, 25), // Is "25" scaled?
        scaledSize: new google.maps.Size(25, 25)
    };

    // Map
    var mapOptions = {
        zoom: 2,
        center: new google.maps.LatLng(23,0)
    };

    map = new google.maps.Map(document.getElementById('map_canvas'),
        mapOptions);

    // Add Count Down div, dynamically
    var divCountdownClock = document.createElement('div');
    divCountdownClock.id = 'Countdown_clock';

    var spanNumberCountdown = document.createElement('span');
    spanNumberCountdown.id = 'numberCountdown';
    divCountdownClock.appendChild(spanNumberCountdown);

    var divMapCanvas = document.getElementById('Game_Body');
    divMapCanvas.insertBefore(divCountdownClock, divMapCanvas.childNodes[2]);

    session.subscribe("edu.cmu.ipd.rounds.newRound", showAnswer).then(
        function(res) {
            console.log('subscribe to rounds.newRound');
        },
        function(err) {
            console.log('error: ', err);
        });

    session.subscribe('edu.cmu.ipd.leaderboard.request', onLeaderBoardReady).then(
        function(res) {
            console.log('subscribe to leaderboard.request');
        },
        function(err) {
            console.log('error: ', err);
        });

    session.subscribe('edu.cmu.ipd.updates.newUpdate', update).then(
        function(res) {
            console.log('subscribe to lupdates.newUpdate');
        },
        function(err) {
            console.log('error: ', err);
        });

    setInterval(function() {
        sessionHandler.call('edu.cmu.ipd.leaderboard.request', [5])
    }, 5 * 1000);

} // End connection.onopen

connection.open();

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
    clearInterval(countdownID);
    document.getElementById("numberCountdown").innerHTML = "";
}

var showQuestion = function(args) {

    console.log('[display]showQuestion() is called');
    var divMapCanvas = document.getElementById('map_canvas');
    divMapCanvas.style.visibility = 'visible';

    var bundle = args[0];

    var game_type = bundle.gameType;
    var paths = [];
    var original_quote = null;
    var translations = [];
    var answer_index = bundle.answer;

    if (bundle.seeds.length === 3) {
        paths.push(bundle.seeds[0]);
        paths.push(bundle.seeds[1]);
        original_quote = bundle.seeds[2]; 

        console.log('bundle is: ',bundle);
    }

    console.log('[display]showQuestion(): bundle.results.length=' + bundle.results.length);

    if (bundle.results.length === 2) {
        translations.push(bundle.results[0]);
        translations.push(bundle.results[1]);
        console.log('results are: ' + bundle.results);
    }

    if (paths.length < 2 || translations.length < 2) {
        console.log('null error');
    }

    // Dismiss markers_1
    if (markers_1.length > 0) {
        for (i = 0; i < markers_1.length; i++) {
            console.log('dismiss marker_1 called');
            markers_1[i].setMap(null);
        }
        // Reset array of markers
        markers_1 = [];
    }
    // Dismiss markers_2
    if (markers_2.length > 0) {
        for (i = 0; i < markers_2.length; i++) {
            console.log('dismiss marker_2 called');
            markers_2[i].setMap(null);
        }
        // Reset array of markers       
        markers_2 = [];
    }

    // Display markers and call drawPath here.
    // Markers for Path 1
    for (i = 0; i < paths[0].length; i++) {
        // image.url = './images/' + countries_1[i].name + '.png'; 
        // console.log('image.url is ' + image.url);
        var location = new google.maps.LatLng(paths[0][i].lat, paths[0][i].lng);
        var marker = new google.maps.Marker({
            position: location,
            map: map
            // icon: image
        });
        markers_1.push(marker); // Add marker
    }
    // InfoWindow for markers in Path 1
    info_contentStr_1 = '<div id="Infowindow_1" class="infowindow">' +
    '<span id="InfowindowText_1" style="font-size: 2em;">'
    + 'English' +
    '</span>' +
    '<div>';   
    // Set initial InfoWindow
    infos[0] = new google.maps.InfoWindow({
        content: info_contentStr_1
    });
    infos[0].open(map, markers_1[0]);   

    // Markers for Path 2
    for (i = 0; i < paths[1].length; i++) {
        // image.url = './images/' + countries_2[i].name + '.png'; 
        // console.log('image.url is ' + image.url);
        var location = new google.maps.LatLng(paths[1][i].lat, paths[1][i].lng);        
        var marker = new google.maps.Marker({
            position: location,
            map: map,
                // icon: image
            });
            markers_2.push(marker); // Add marker        
    }
    info_contentStr_2 = '<div id="Infowindow_2" class="infowindow">' +
    '<span id="InfowindowText_2" style="font-size: 2em;">'
    + 'English' +
    '</span>' +
    '<div>';      
    // Set initial InfoWindow    
    infos[1] = new google.maps.InfoWindow({
        content: info_contentStr_2
    });
    infos[1].open(map, markers_2[0]);

    addPathResultdivs();

    resetLines();
    drawPath1(paths[0], [], [], 0);
    drawPath2(paths[1], [], [], 0);  

    document.getElementById("question").innerHTML = 'Original Text: '+ original_quote + '<br>' + 'Translation: ' + translations[answer_index];
    // document.getElementById("question").innerHTML = "Brazil";
    console.log('showing question');

    sessionHandler.call('edu.cmu.ipd.leaderboard.request', [5]);


} // End showQuestion


var drawPathClosure = function(pathNum) {

    return function(countries, l, markers, path_index) {
        console.log('Countries are: ', countries);
        var step = 0;
        var numSteps = 100; //Change this to set animation resolution
        var timePerStep = 20; //Change this to alter animation speed, 5ms

        var loc_departure = new google.maps.LatLng(countries[path_index].lat, countries[path_index].lng);
        var loc_arrival = new google.maps.LatLng(countries[path_index + 1].lat, countries[path_index + 1].lng);
        var departure = loc_departure;
        var arrival = loc_arrival;
        var color = "#000000";

        console.log('%s to %s', countries[path_index].name, countries[path_index+1].name);

        if (pathNum === 1) {
            color = "#0000FF";
            markers = markers_1;
        }
        else {
            color = "#FF0000";
            markers = markers_2;
        }

        l[path_index] = new google.maps.Polyline({
            path: [departure, departure],
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            icons: [{
                icon: lineSymbol,
                offset: '100%',
                // repeat: '50px'
            }],
            geodesic: true, //set to false if you want straight line instead of arc
            map: map,
        });

        var interval = setInterval(function() {
            step += 1;
            if (step > numSteps){
                clearInterval(interval); // Stop the interval?
                path_index++;

                console.log('path_index is: ', path_index);
                if (path_index < countries.length-1) {
                    if (pathNum === 1) {
                        document.getElementById("InfowindowText_1").innerHTML = countries[path_index].language;
                        document.getElementById("InfowindowText_1").style.color = "#0000FF";
                        infos[0].open(map, markers[path_index]); 

                        drawPath1(countries, l, markers, path_index);

                    }
                    else { 
                        document.getElementById("InfowindowText_2").innerHTML = countries[path_index].language;
                        document.getElementById("InfowindowText_2").style.color = "#FF0000";
                        infos[1].open(map, markers[path_index]); 

                        drawPath2(countries, l, markers, path_index);
                    }
                }
                else {
                    console.log('Draw final InfoWindow');
                    // Display Final InfoWindow
                    document.getElementById("InfowindowText_1").innerHTML = countries[path_index].language;
                    infos[0].open(map, markers[path_index]); 

                    document.getElementById("InfowindowText_2").innerHTML = countries[path_index].language;
                    document.getElementById("InfowindowText_2").style.color = "#000000";
                    infos[1].open(map, markers[path_index]);

                    if (pathNum === 1) {
                        // Start the countdown interval after path1 completes
                        // We assume that path 2 also will complete at the same time
                        // because they have same number of cities in the path
                        setTimeout(function() {
                             countdownID = setInterval(startCountdown(), 1000);
                        }, 5000);
                    }
                }
                console.log('Drew line: ', path_index);
                console.log('step: %d, numSteps: %d', step, numSteps);
            }
            else {
                var fraction = step/numSteps;
                var progress = google.maps.geometry.spherical.interpolate(departure, arrival, fraction);

                l[path_index].setPath([departure, progress]);
            }
        }, timePerStep);
        if (pathNum === 1)
            lines1 = l;
        else
            lines2 = l;
    }
};

drawPath1 = drawPathClosure(1);
drawPath2 = drawPathClosure(2);

function resetLines() {
    for (var i=0; i<lines1.length; i++) {
        lines1[i].setMap(null);
        lines2[i].setMap(null);
    }
}

function addPathResultdivs() {
    var divMapCanvas = document.getElementById('map_canvas');
    
    var patha_res = document.createElement('div');
    patha_res.id = 'patha_res';
    patha_res.className = 'Path_Res';
    var patha_span = document.createElement('span');
    patha_span.id = 'patha_span';
    patha_span.className = 'Path_Res_Span';
    patha_res.appendChild(patha_span);

    var pathb_res = document.createElement('div');
    pathb_res.id = 'pathb_res';
    pathb_res.className = 'Path_Res';
    var pathb_span = document.createElement('span');
    pathb_span.className = 'Path_Res_Span';
    pathb_span.id = 'pathb_span';
    pathb_res.appendChild(pathb_span);
    
    divMapCanvas.appendChild(patha_res);
    divMapCanvas.appendChild(pathb_res);

}

function showAnswer(args) {

    if (gbundle === null) {
        console.log('No previous bundle, waiting 5 secs before showing the question');
        gbundle = args[0];
        setTimeout(showQuestion, 5000, args);
    } else {
        stopCountdown();
        
        res = gbundle;
        gbundle = args[0];
        var divMapCanvas = document.getElementById('map_canvas');
        divMapCanvas.style.visibility = 'hidden';

        var winner = null;
        if (res.answer === 0)
            winner = 'Blue Path is the winner!';
        else
            winner = 'Red Path is the winner';
        document.getElementById('question').innerHTML = winner;

        var patha_span = document.getElementById('patha_res');
        var pathb_span = document.getElementById('pathb_res');
        patha_span.innerHTML = 'Blue Path: ' + res.results[0];
        pathb_span.innerHTML = 'Red Path: ' + res.results[1];
        
        setTimeout(showQuestion, 5000, args);
    }
}

onLeaderBoardReady = function(args) {
    console.log('[Display] onLeaderBoardReady called.');
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

$(document).ready(function() {
    console.log('documet.ready');
    // $('.flipper').addClass('flipperStart');
    setInterval(flip, 15 * 1000);

    var qr_url = 'http://'+location.host+'/device/index.html';
    console.log(qr_url);
    $('#qr_code_left').qrcode(qr_url);
    $('#qr_code_right').qrcode(qr_url);
});

var flip = function() {
    var front = false;
    return function() {
        console.log('flip is called');
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

