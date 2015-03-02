//var autobahn = require('autobahn');
var connection = new autobahn.Connection({
    url: 'ws://127.0.0.1:8080/ws',
    realm: 'realm1'
})

var city_left = "Mountain View";
var city_right = "Palo Alto";
var city_left_src;
var city_right_src;
var answer_submitted;

connection.onopen = function (session) {

    console.log("mobile frontend connected.");

    document.getElementById('city-left').innerHTML = city_left;
    city_left_src = "https://maps.googleapis.com/maps/api/streetview?size=200x200&location=37.389471, -122.082199&fov=90&heading=235&pitch=10";
    document.getElementById('city-image-left').src = city_left_src;

    document.getElementById('city-right').innerHTML = city_right;
    city_right_src = "https://maps.googleapis.com/maps/api/streetview?size=200x200&location=37.444321, -122.159872&fov=90&heading=235&pitch=10";
    document.getElementById('city-image-right').src = city_right_src;

    /* Subscribe to .types channel. This message is published every 5000ms to post a questions */
    var onNewQuestion = function (args) {
        var type = args[0];
        document.getElementById("questionText").innerHTML = "Which city has more " + type;
        console.log('Updating place_type to ', type);
        document.getElementById("result").innerHTML = "";
    }
    session.subscribe("edu.cmu.ipd.types", onNewQuestion).then(
      function (sub) {
          console.log('subscribed to .types');
      },
      function (err) {
          console.log('failed to subscribe to .types', err);
      });


    /* Add onClick listener to each button. Once a choice is clicked, it calls RPC in backend to submit answer*/
    var submitAnswer = function (answer) {
        session.call("edu.cmu.ipd.onpoll", [answer]).then(
            function (res) {
                console.log("successfully submit answer.");
            },
            function (err) {
                console.log("Answer submission failed.", err);
            }
        );
    }
    document.getElementById("city-left").onclick = function (event) {
        answer_submitted = city_left;
        submitAnswer(answer_submitted);
        console.log("answer_submitted: " + city_left);
    }
    document.getElementById("city-right").onclick = function (event) {
        answer_submitted = city_right;
        submitAnswer(answer_submitted);
        console.log("answer_submitted: " + city_right);
    }


    /* Subscribe to winner channel. Display correct answer. */
    var onCorrectAns = function (city_correctAnswer) {
        if (answer_submitted === undefined || city_correctAnswer === undefined)
        {
            console.log("Error: answer undefined");
        }
        else
        {
            // If answer is correct
            if (answer_submitted == city_correctAnswer)
            {
                document.getElementById("result").innerHTML = "Correct!";
                document.getElementById("result").style.color = "#3CB371"; // MediumSeaGreen 
            }
            else
            {
                document.getElementById("result").innerHTML = "Nope...";
                document.getElementById("result").style.color = "#B22222"; // FireBrick red
            }
        }
    }

    session.subscribe("edu.cmu.ipd.winner", onCorrectAns).then(
    function (sub) {
        console.log('subscribed to .winner');
    },
    function (err) {
        console.log('failed to subscribe to .winner', err);
    });

    /* Subscribe to .onvote channel. This message is published
           when any client submit an answer */
    //var onNewVote = function (args) {

    //    var update = args[0];
    //    var opt = update.optSEQ === 0 ? 'A' : (update.optSEQ === 1 ? 'B' : 'C');
    //    document.getElementById("polls" + opt).value = update.value;
    //}

    //session.subscribe("edu.cmu.ipd.onvote", onNewVote).then(
    //    function (sub) {
    //        console.log("subscribe to .onvote");
    //    },
    //    function (err) {
    //        console.log("fail to subscribe to .onvote");
    //    });

    ///* Retrieve the current question. This is only called only once upon loading the page */
    //session.call("edu.cmu.ipd.loadquestion", [0]).then(
    //	function (res) {
    //	    onNewQuestion(res);
    //	});
    onNewQuestion(['bar']);
}

connection.open();
