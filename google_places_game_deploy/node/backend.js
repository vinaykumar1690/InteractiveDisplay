//Put the backend js file here
var autobahn = require('autobahn');

var when = require('when');

var model = require('../../db/model.js');

var places_question = require('./cities_and_types.js');
var places_answer = require('./getAnswer.js');

var urls = require('../../url/url.js');

var connection = new autobahn.Connection({
	url: 'ws://' + urls.crossbarURL + '/ws',
	realm: 'realm1'
});


var userBehaviorUpdates = [];



var currBundle = null;

connection.onopen = function(session) {
	console.log('google places node connected.');

	session.register('edu.cmu.ipd.users.createUser', createUser(session)).then(

      function (reg) {
         console.log('.users.createUser registered');
      },
      function (err) {
         console.log('.users.createUser failed in registration', err);
      });

  session.register('edu.cmu.ipd.users.updateScore', updateScore).then(
      function (reg) {
         console.log('.users.updateScore registered');
      },
      function (err) {
         console.log('.users.updateScore failed in registration', err);
      });

  session.register('edu.cmu.ipd.rounds.currentRound', getCurrentRound).then(
      function(reg) {
        console.log('.rounds.currentRound registered');
      },
      function(err) {
        console.log('.rounds.currentRound failed in registration', err);
      }
  );

  session.register('edu.cmu.ipd.leaderboard.request', topN(session)).then(
    function(reg) {
      console.log('.leaderboard.request registered');
    },
    function(err) {
      console.log('.leaderboard.request railed in registration');
    }
  );

  setInterval(question(session), 21*1000);
}

/*
 * createUser is a closure of session.
 * return 	: a RPC call that for registration call, 
 */
var createUser = function(session) {
	
	var onCreatedUser = function(token) {
		var userNameToken = token;
		return function(appliedUserName) {
			console.log('[backend]: onCreatedUser: user[' + appliedUserName + '] with token[' + userNameToken + ']' );
			session.publish('edu.cmu.ipd.users.onCreatedUser', [userNameToken, appliedUserName], {}, { acknowledge: true}).then(
				function(publication) {
					console.log("published, publication ID is ", publication);
                  		},
                  		function(error) {
                    			console.log("publication error", error);
                  	});
		}
	}

	var userToken = 0;
	return function (args) {
		userToken++;
		console.log('[backend] createUser: called with input{' + args[0] + '}');
		try {
			model.createUser(args[0].trim(), onCreatedUser(userToken));
		} catch (err) {
			console.log(err.message);
		}
		return [userToken];
	}
}

var updateScore = function(args) {
  
  var userName = args[0];
  var score    = args[1];
  try {
    model.updateScore(userName, score);
  } catch (err) {
    console.log('updateScore exception: ' + err.message);
  }

  userBehaviorUpdates.push()
  return [];
}


var question = function(session) {
  
  var commHandler = session;
  var answers = require('./getAnswer.js');
  var questions = require('./cities_and_types.js');

  return function() {
    
    question = questions.getQuestion();

    var onResponse = function() {

      var bundle = {
        option0 : null,
        option1 : null,
      }

      return function (opt) {
        
        return function(res) {
          
          var generateBundle = function(qBundle, apiResultBundle) {
            var ret = {};
            ret.place_type = qBundle.place_type.display_name;
            ret.options = [qBundle.city1, qBundle.city2];
            ret.statistics = [apiResultBundle.option0, apiResultBundle.option1];
            console.log('option0: ' + apiResultBundle.option0, 'option1: ' + apiResultBundle.option1);
            if (apiResultBundle.option0 < apiResultBundle.option1) {
              ret.answer = qBundle.city2.name;
            } else {
              ret.answer = qBundle.city1.name;
            }
            return ret;
          }

          res.setEncoding('utf8');

          responseBody = "";

          res.on('data', function(d) {
            responseBody += d;
          });

          res.on('end', function() {
            
            // console.log(responseBody);

            try {
              responseBody = JSON.parse(responseBody);
            } catch (e) {
              console.log(e);
              answers.getAnswer(0, question.city1.lat ,question.city1.lng, 2 * 1000, question.place_type.full_name, onResponse, onError, null);
              answers.getAnswer(1, question.city2.lat ,question.city2.lng, 2 * 1000, question.place_type.full_name, onResponse, onError, null);
              return;
            }
            if (opt === 0) {
              bundle.option0 = responseBody.results.length;
              if (bundle.option1 !== null) {
                var pubData = generateBundle(question, bundle);
                currBundle = pubData;
                session.publish('edu.cmu.ipd.rounds.newRound', [pubData], {}, { acknowledge: true}).then(
                  function(publication) {
                    console.log("published, publication ID is ", publication);
                  },
                  function(error) {
                    console.log("publication error", error);
                  });
                
              }
            } else if (opt === 1) {
              bundle.option1 = responseBody.results.length;
              if (bundle.option0 !== null) {
                var pubData = generateBundle(question, bundle);
                currBundle = pubData;
                session.publish('edu.cmu.ipd.rounds.newRound', [pubData], {}, { acknowledge: true}).then(
                  function(publication) {
                    console.log("published, publication ID is ", publication);
                  },
                  function(error) {
                    console.log("publication error", error);
                  });
              }
            }
          });
        }
      }
    }();

    var onError = function(err) {
      console.log('err');
    }
    
    console.log('full name: ' + question.place_type.full_name);
    answers.getAnswer(0, question.city1.lat ,question.city1.lng, 2 * 1000, question.place_type.full_name, onResponse, onError, null);
    answers.getAnswer(1, question.city2.lat ,question.city2.lng, 2 * 1000, question.place_type.full_name, onResponse, onError, null);
  }
}

var getCurrentRound = function(args){
  return [currBundle]
}

var topN = function(session) {
  
  return function(args) {
    N = args[0];
    onLeaderBoardReady = function(param) {
      session.publish('edu.cmu.ipd.leaderboard.request', param, {}, { acknowledge: true}).then(
        function(publication) {
          console.log("leaderboard published with ID: " + publication);
        },
        function(error) {
          console.log('leaderboard published with error', error);
        });
    }
    model.getTopNUsers(N, onLeaderBoardReady);
  }
}

var submitAnswer = function(args) {
  update = {
    userName : args[0],
    action   : 'submit',
  }
  userBehaviorUpdates.push(update);
}


connection.open();
