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

var path_length = 5;
var map;

// function initialize() {
connection.onopen = function(session) {
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

    session.subscribe("edu.cmu.ipd.rounds.newRound", showQuestion).then(
        function(res) {
            console.log('subscribe to newRound');
        },
        function(err) {
            console.log('error: ', err);
        });

    session.subscribe('edu.cmu.ipd.leaderboard.request', onLeaderBoardReady);

    session.subscribe('edu.cmu.ipd.updates.newUpdate', update);

} // End connection.onopen

connection.open();

var showQuestion = function(args) {

    console.log('[display]showQuestion() is called');

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

    ret = {
        gametype : 'translator',
        results : ['She sells sea shells at the sea floor', 'Sells sea floor at sea'],
        answer : 1
    }
    setTimeout(showAnswer, 5000, ret);

    drawPath2(paths[1]);  
    drawPath1(paths[0]);

    document.getElementById("question").innerHTML = 'Original Text: '+ original_quote + '\n' + 'Translation: ' + translations[answer_index];
    // document.getElementById("question").innerHTML = "Brazil";
    console.log('showing question');

    // sessionHandler.call('edu.cmu.ipd.leaderboard.request', [5]);

    // setTimeout(function() {
    //     coundownID = setInterval(startCountdown(), 1000);
    // }, 8000);

} // End showQuestion


var drawPathClosure = function(pathNum) {
    var path_index = 0;
    var l = [];  
    var markers = [];

    return function(countries) {
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

                if (path_index < 5) {
                    if (pathNum === 1) {
                        drawPath1(countries);

                    }
                    else { 
                        drawPath2(countries);
                    }
                    if (pathNum === 1)
                    {
                        document.getElementById("InfowindowText_1").innerHTML = countries[path_index].language;
                        document.getElementById("InfowindowText_1").style.color = "#0000FF";
                        infos[0].open(map, markers[path_index]); 
                    }
                    else
                    { 
                        document.getElementById("InfowindowText_2").innerHTML = countries[path_index].language;
                        document.getElementById("InfowindowText_2").style.color = "#FF0000";
                        infos[1].open(map, markers[path_index]); 
                    }
                }
                else {
                    // Display Final InfoWindow
                    document.getElementById("InfowindowText_1").innerHTML = countries[path_index].language;
                    infos[0].open(map, markers[path_index]); 

                    document.getElementById("InfowindowText_2").innerHTML = countries[path_index].language;
                    document.getElementById("InfowindowText_2").style.color = "#000000";
                    infos[1].open(map, markers[path_index]);
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
    }
};


var drawPath1 = drawPathClosure(1);
var drawPath2 = drawPathClosure(2);


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

function showAnswer(ret) {
    var divMapCanvas = document.getElementById('map_canvas');
    divMapCanvas.style.visibility = 'hidden';

    var winner = null;
    if (ret.answer === 0)
        winner = 'Path A is the winner!';
    else
        winner = 'Path B is the winner';
    document.getElementById('question').innerHTML = winner;

    var patha_span = document.getElementById('patha_res');
    var pathb_span = document.getElementById('pathb_res');
    patha_span.innerHTML = ret.results[0];
    pathb_span.innerHTML = ret.results[1];
        
//    divMapCanvas.style.visibility = 'visible';
}

