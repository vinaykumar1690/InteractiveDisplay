
Array.prototype.getRandom = ( function() {
	var previous = -1;
	return function() {
		if (this.length == 0) {
			return;
		} else if (this.length == 1) {
			return this[0];
		} else {
			var num = 0;
			do {
				num = Math.floor(Math.random() * this.length);
			} while (num == previous);
			previous = num;
			return this[num];
		}
	}
})();

/* List of cities and their coordinates */
var westCities = [
{name: "New York City", lat: 40.7127, lng: -74.0059},
{name: "Chicago", lat: 41.8369, lng: -87.6847},
{name: "Paris", lat: 48.8567, lng: 2.3508},
{name: "Sao Paulo", lat: -23.5500, lng: -46.6333},
{name: "Rome", lat: 41.9000, lng: 12.5000},
{name: "Berlin", lat: 52.5167, lng: 13.3833}
];


var eastCities = [
	{name: "Tokyo", lat: 35.6833, lng: 139.6833},
	{name: "Shanghai", lat: 31.2000, lng: 121.5000},
	{name: "Sydney", lat: -33.8667, lng: 151.2094},
	{name: "Delhi", lat: 28.6139, lng: 77.2090},
	{name: "Mumbai", lat: 18.9750, lng: 72.8258},
]


var types = [];
/* Supported place search */
/* Deleted ["health",] */
var types_full = [
"airport", "amusement_park", "aquarium", "art_gallery",
"atm", "bakery", "bank", "bar", "beauty_salon",
"bicycle_store", "book_store", "bowling_alley", "bus_station", "cafe",
"campground", "car_dealer", "car_rental", "car_repair", "car_wash",
"casino", "city_hall", "clothing_store",
"convenience_store", "dentist", "department_store",
"doctor", "electrician", "electronics_store", "embassy",
"finance", "fire_station", "florist", "food", 
"furniture_store", "gas_station", "grocery_or_supermarket", "gym",
"hair_care", "hardware_store", "home_goods_store",
"hospital", "jewelry_store", "laundry", 
"library", "locksmith", "lodging",
"meal_delivery", "meal_takeaway", "movie_rental", "movie_theater",
"moving_company", "museum", "night_club", "painter", "park",
"parking", "pet_store", "pharmacy", "place_of_worship",
"plumber", "post_office", "real_estate_agency", "restaurant",
"roofing_contractor", "rv_park", "school", "shoe_store", "shopping_mall",
"spa", "stadium", "storage", "store", "subway_station",
"taxi_stand", "train_station", "travel_agency", "university",
"veterinary_care", "zoo"
];

for (i = 0; i < types_full.length; i++){
	if (types_full[i]){	
		var fullName = types_full[i];
		var displayName = fullName.replace(/_/g," "); // Eliminate of underscore("_")

		var newType = {full_name: fullName, display_name: displayName};
		types.push(newType); // Add new type element into array
	}
	else{
		console.log('Type: NO DATA.');
	}
}
// console.log(types);

exports.getQuestion = function(){
    /* Make a question */
    var question = {
        city1: westCities.getRandom(),
        city2: eastCities.getRandom(),
        place_type: types.getRandom()
    }
	return question;
}
