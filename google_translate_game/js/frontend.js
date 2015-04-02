function initialize() {

	var lineSymbol = {
		path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
	};

	var mapOptions = {
		zoom: 2,
		center: new google.maps.LatLng(0,0),
		// mapTypeId: google.maps.MapTypeId.TERRAIN
	};

	// Here we use capital city's coordinate to represent a country.
	var loc_WashingtonDC = new google.maps.LatLng(38.9047, -77.0164); // US
	var loc_Berlin = new google.maps.LatLng(52.5167, 13.3833); // Germany
	var loc_Tokyo = new google.maps.LatLng(35.6833, 139.6833); // Japan
	var loc_Brasilia = new google.maps.LatLng(-15.7939, -47.8828); // Portuguese, Brazil

	var Triangle;

	var map = new google.maps.Map(document.getElementById('map-canvas'),
		mapOptions);

	// List of countries
	var countries = [
	{name: "US", language: "English-US", location: loc_WashingtonDC},
	{name: "Germany", language: "Germany", location: loc_Berlin},
	{name: "Brazil", language: "Portuguese-Brazil", location: loc_Brasilia},
	{name: "US", language: "English-US", location: loc_WashingtonDC},
	];
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

	// Construct the polygon.
	Triangle = new google.maps.Polygon({
		paths: countriesCoords,
		strokeColor: '#FF0000',
		strokeOpacity: 0.8,
		strokeWeight: 2,
		icons: [{
			icon: lineSymbol,
			offset: '100%'
		}],
	});
	// Triangle.setMap(map);

	Triangle_line = new google.maps.Polyline({
		path: [new google.maps.LatLng(38.9047, -77.0164), new google.maps.LatLng(52.5167, 13.3833)],
		icons: [{
			icon: lineSymbol,
			offset: '100%'
		}],
		// map: map
	});
	lines = [{},{},{}];

 	for (var j = 0; j < 2; j++) {
 		var step = 0;
 		var numSteps = 100; //Change this to set animation resolution
 		var timePerStep = 20; //Change this to alter animation speed, 5ms
 		var departure = countries[j].location;
 		var arrival = countries[j + 1].location;
 		console.log('%s to %s', countries[j].name, countries[j+1].name);

 		lines[j] = new google.maps.Polyline({
			path: [departure, departure],
			strokeColor: "#0000FF",
			strokeOpacity: 0.8,
			strokeWeight: 2,
			icons: [{
				icon: lineSymbol,
				offset: '100%'
			}],
	  		geodesic: true, //set to false if you want straight line instead of arc
	  		map: map,
		});

 		var l = lines[j];
 		console.log('l is: ', l);


 		// do {
 			// step += 1;
 			// console.log('step is : ', step);

 			// var interval = setInterval(function() {
 			// 	step += 1;

 			// 	console.log('Drew line: ', j);
 			// 	console.log('step: %d, numSteps: %d', step, numSteps);

 			// 	var fraction = step/numSteps;
 			// 	var progress = google.maps.geometry.spherical.interpolate(departure, arrival, fraction);

 			// 	l.setPath([departure, progress]);
 			// }, timePerStep);

 		// } while (step < numSteps);

 		// while (step < numSteps) {
 		// 	console.log('step is : ', step);
 			var interval = setInterval(function() {
 				step += 1;

 				if (step > numSteps){
 					clearInterval(interval); // Stop the interval?

 					console.log('Drew line: ', j);
 					console.log('step: %d, numSteps: %d', step, numSteps);
				}
				else {
 				var fraction = step/numSteps;
 				var progress = google.maps.geometry.spherical.interpolate(departure, arrival, fraction);

 				l.setPath([departure, progress]);
 				}
 			}, timePerStep);
 		// }
		
 		// setTimeout(function(){
   		//      	console.log("Hello");
   		//   	}, 2*1000); // Wait for 2 sec to draw the next line.
 	
 	} // end for loop
 
} // End initialize()

google.maps.event.addDomListener(window, 'load', initialize);