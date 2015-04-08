var mapOptions = {
    zoom: 2,
    center: new google.maps.LatLng(23,0),
};

var map = new google.maps.Map(document.getElementById('map_canvas'),
    mapOptions);

// Here we use capital city's coordinate to represent a country.
var loc_WashingtonDC = new google.maps.LatLng(38.9047, -77.0164); // US
var loc_Berlin = new google.maps.LatLng(52.5167, 13.3833); // Germany
var loc_Brasilia = new google.maps.LatLng(-15.7939, -47.8828); // Portuguese, Brazil
var loc_Brazzaville = new google.maps.LatLng(-4.2471, 15.2272);
var loc_Tunis = new google.maps.LatLng(-22.5632, 17.0707);
var loc_London = new google.maps.LatLng(51.5072, -0.1275);

var loc_Tokyo = new google.maps.LatLng(35.6833, 139.6833); // Japan
var loc_Paris = new google.maps.LatLng(48.8588, 2.3470);
var loc_Delhi = new google.maps.LatLng(28.6454, 77.0907);
var loc_Seoul = new google.maps.LatLng(37.5651, 126.9895);
var loc_Rome = new google.maps.LatLng(41.9100, 12.5359);

// List of countries
var countries_1 = [
{name: "England", language: "English", location: loc_London},
{name: "Germany", language: "Germany", location: loc_Berlin},
{name: "Brazil", language: "Portuguese-Brazil", location: loc_Brasilia},
{name: "Congo", language: "Swahili", location: loc_Brazzaville},
{name: "Tunisia", language: "Arabic", location: loc_Tunis},
{name: "England", language: "English", location: loc_London}
];

var countries_2 = [
{name: "England", language: "English", location: loc_London},
{name: "Japan", language: "Japanese", location: loc_Tokyo},
{name: "Paris", language: "French", location: loc_Paris},
{name: "Delhi", language: "Hindi", location: loc_Delhi},
{name: "Seoul", language: "Korean", location: loc_Seoul},
{name: "England", language: "English", location: loc_London}
];

var lineSymbol = {
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
};

var markers_1 = [];
var markers_2 = [];

var infos = [{},{}];

var path_length = 5;

function initialize() {	
    // Define the LatLng coordinates for the polygon's path.
	// var countriesCoords = [];
	
	var image = {
		url: '',
		// size: new google.maps.Size(71, 71),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(0, 25), // Is "25" scaled?
		scaledSize: new google.maps.Size(25, 25)
	};

// Markers for Path 1
for (i = 0; i < countries_1.length; i++) {
  image.url = './images/' + countries_1[i].name + '.png'; 
		// console.log('image.url is ' + image.url);
		var marker = new google.maps.Marker({
			position: countries_1[i].location,
			map: map,
			// icon: image
		});
        markers_1.push(marker); // Add marker
    }
    info_contentStr_1 = '<div id="Infowindow_1" class="infowindow">' +
    '<span id="InfowindowText_1" style="font-size: 2em;">'
    + 'English' +
    '</span>' +
    '<div>';   
    infos[0] = new google.maps.InfoWindow({
        content: info_contentStr_1
    });
    infos[0].open(map, markers_1[0]);

// Markers for Path 2
for (i = 0; i < countries_2.length; i++) {
    image.url = './images/' + countries_2[i].name + '.png'; 
        // console.log('image.url is ' + image.url);
        var marker = new google.maps.Marker({
            position: countries_2[i].location,
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
    infos[1] = new google.maps.InfoWindow({
        content: info_contentStr_2
    });
    infos[1].open(map, markers_2[0]);

    drawPath2(countries_2);  
    drawPath1(countries_1);

} // End initialize()


var drawPathClosure = function(pathNum) {
    var path_index = 0;
    var l = [];  
    var markers = [];

    return function(countries) {
        console.log('Countries are: ', countries);
        var step = 0;
        var numSteps = 100; //Change this to set animation resolution
        var timePerStep = 20; //Change this to alter animation speed, 5ms
        var departure = countries[path_index].location;
        var arrival = countries[path_index + 1].location;
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

google.maps.event.addDomListener(window, 'load', initialize);
