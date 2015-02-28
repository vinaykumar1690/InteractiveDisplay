var autobahn = require('autobahn');

var connection = new autobahn.Connection({
url: 'ws://127.0.0.1:8080/ws',
realm: 'realm1'
})


connection.onopen = function(session) {

    console.log("backend connected.");

    Array.prototype.randomDiffElement = function(last) {
        if (this.length == 0) {
            return;
        } else if (this.length == 1) {
            return this[0];
        } else {
            var num = 0;
            do {
                num = Math.floor(Math.random() * this.length);
            } while (this[num] == last);
            return this[num];
        }
    }	

    /* Supported place search */
    var types = [
        airport, amusement_park, aquarium, art_gallery,
        atm, bakery, bank, bar, beauty_salon,
        bicycle_store, book_store, bowling_alley, bus_station, cafe,
        campground, car_dealer, car_rental, car_repair, car_wash,
        casino, city_hall, clothing_store,
        convenience_store, dentist, department_store,
        doctor, electrician, electronics_store, embassy,
        finance, fire_station, florist, food, 
        furniture_store, gas_station, grocery_or_supermarket, gym,
        hair_care, hardware_store, health, home_goods_store,
        hospital, jewelry_store, laundry, 
        library, locksmith, lodging,
        meal_delivery, meal_takeaway, movie_rental, movie_theater,
        moving_company, museum, night_club, painter, park,
        parking, pet_store, pharmacy, place_of_worship,
        plumber, post_office, real_estate_agency, restaurant,
        roofing_contractor, rv_park, school, shoe_store, shopping_mall,
        spa, stadium, storage, store, subway_station,
        taxi_stand, train_station, travel_agency, university,
        veterinary_care, zoo
    ];

    /* Current question counter */
    var questionCounter = 0;

    /* Answer collections */
    var answers = [];


    /* Question pool */
    var question0 = {
     seq: 0,
     question: 'When was cmu founded?',
     options: ["1900", "1905", "1910"], 
    }

    var question1 = {
     seq: 1,
     question: 'Where is the main campus of CMU?',
     options: ['Pittsburgh, PA', 'Mountain View, CA', 'Guangzhou, China']
    }

    var question2 = {
     seq: 2,
     question: "Who did Vinay date with on Feb 17?",
     options: ["Venkey", "Megha", "Pei"]
    }

    var questions = [question0, question1, question2];

    /* Register RPC call. This RPC is called by client to submit answer */
    var submitAnswer = function(args) {
        var answer = args[0];
        if (answers[answer.qSEQ] === undefined) {
            answers[answer.qSEQ] = {
            seq: answer.qSEQ,
            optsCounter:[0, 0, 0]
            }
        }
        answers[answer.qSEQ].optsCounter[answer.opt] += 1;
        var update = {
         optSEQ : answer.opt,
         value  : answers[answer.qSEQ].optsCounter[answer.opt]
        }
        console.log(update);
        session.publish("edu.cmu.ipd.onvote", [update]);
    }

    session.register('edu.cmu.ipd.onpoll', submitAnswer).then(
            function (reg) {
                console.log('submitAnswer registered');
            },
            function (err) {
                console.log('failed to register submitAnswer', err);
            });


    /* Periodically generate questions and push to client */
    var issueQuestion = function() {
        i = ++questionCounter % 3;
        question = questions[i];
        answer   = answers[i] === undefined ? 
            [0, 0, 0] : answers[i].optsCounter;
        session.publish('edu.cmu.ipd.questions', [question, answer]);
    }

    t1 = setInterval(issueQuestion, 5000);


    /* This RPC is called when webpage loaded */
    var loadQuestion = function() {
        var retQ = questions[questionCounter % 3];
        var retAnswerOpts = answers[questionCounter % 3] === undefined ? 
            [0, 0, 0] : answers[questionCounter % 3].optsCounter;
        return [retQ, retAnswerOpts];
    }

    session.register("edu.cmu.ipd.loadquestion", loadQuestion).then(
            function(reg) {
                console.log("succeed to register .loadquestion");
            },
            function(err) {
                console.log("fail to register .loadquestion");
            });
}

connection.open();
