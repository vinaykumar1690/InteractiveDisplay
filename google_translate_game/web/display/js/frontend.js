var mapOptions = {
    zoom: 2,
    center: new google.maps.LatLng(0,0),
    // mapTypeId: google.maps.MapTypeId.TERRAIN
};

var map = new google.maps.Map(document.getElementById('map_canvas'),
    mapOptions);

// Here we use capital city's coordinate to represent a country.
var loc_WashingtonDC = new google.maps.LatLng(38.9047, -77.0164); // US
var loc_Berlin = new google.maps.LatLng(52.5167, 13.3833); // Germany
var loc_Tokyo = new google.maps.LatLng(35.6833, 139.6833); // Japan
var loc_Brasilia = new google.maps.LatLng(-15.7939, -47.8828); // Portuguese, Brazil

// List of countries
var countries = [
	{name: "US", language: "English-US", location: loc_WashingtonDC},
	{name: "Germany", language: "Germany", location: loc_Berlin},
	{name: "Brazil", language: "Portuguese-Brazil", location: loc_Brasilia},
	{name: "US", language: "English-US", location: loc_WashingtonDC},
];

var lineSymbol = {
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
};

function initialize() {
	var Triangle;
	
    // Define the LatLng coordinates for the polygon's path.
	var countriesCoords = [];
	
	var image = {
		url: '',
		// size: new google.maps.Size(71, 71),
		origin: new google.maps.Point(0, 0),
		anchor: new google.maps.Point(0, 25), // Is "25" scaled?
		scaledSize: new google.maps.Size(25, 25)
	};

	for (i = 0; i < countries.length; i++) {
		image.url = './images/' + countries[i].name + '.png'; 
		console.log('image.url is ' + image.url);
		var marker = new google.maps.Marker({
			position: countries[i].location,
			map: map,
			icon: image
		});
		countriesCoords.push(countries[i].location);
	}
	console.log(countriesCoords);

    drawPath();
 
} // End initialize()

var drawPath = (function() {
    var path_index = 0;
	l = [{},{},{}];
    
    return function() {
        var step = 0;
        var numSteps = 100; //Change this to set animation resolution
        var timePerStep = 20; //Change this to alter animation speed, 5ms
        var departure = countries[path_index].location;
        var arrival = countries[path_index + 1].location;
        console.log('%s to %s', countries[path_index].name, countries[path_index+1].name);

        l[path_index] = new google.maps.Polyline({
            path: [departure, departure],
            strokeColor: "#0000FF",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            icons: [{
                icon: lineSymbol,
                offset: '100%',
                repeat: '50px'
            }],
            geodesic: true, //set to false if you want straight line instead of arc
            map: map,
        });

        var interval = setInterval(function() {
            step += 1;

            if (step > numSteps){
                clearInterval(interval); // Stop the interval?
                path_index++;
                if (path_index < 3) {
                    drawPath();
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

})();

google.maps.event.addDomListener(window, 'load', initialize);
