var autobahn = require('autobahn');

var connection = new autobahn.Connection({
url: 'ws://127.0.0.1:8080/ws',
realm: 'realm1'
})


connection.onopen = function(session) {

    console.log("backend connected.");

    Array.prototype.getRandom = ( function() {
        var previous = "random";
        return function() {
            if (this.length == 0) {
                return;
            } else if (this.length == 1) {
                return this[0];
            } else {
                var num = 0;
                do {
                    num = Math.floor(Math.random() * this.length);
                } while (this[num] == previous);
                previous = this[num];
                return this[num];
            }
        }
    })();

    /* Supported place search */
    var types = [
        "airport", "amusement_park", "aquarium", "art_gallery",
        "atm, bakery", "bank", "bar", "beauty_salon",
        "bicycle_store", "book_store", "bowling_alley", "bus_station, cafe",
        "campground", "car_dealer", "car_rental", "car_repair", "car_wash",
        "casino", "city_hall", "clothing_store",
        "convenience_store", "dentist", "department_store",
        "doctor", "electrician", "electronics_store", "embassy",
        "finance", "fire_station", "florist", "food", 
        "furniture_store", "gas_station", "grocery_or_supermarket", "gym",
        "hair_care", "hardware_store", "health", "home_goods_store",
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

    var issueType = function() {
        session.publish('edu.cmu.ipd.types', [types.getRandom()]);
    }
    types_timer = setInterval(issueType, 5000);

}

connection.open();
