//Put the backend js file here
var autobahn = require('autobahn');

var model = require('../../db/model.js');

var connection = new autobahn.Connection({
	url: 'ws://localhost:8080/ws',
	realm: 'realm1'
});

var userBehaviorUpdates = [];

var currBundle = null;

connection.onopen = function(session) {
	
  console.log('google translator node connected.');

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

  session.register('edu.cmu.ipd.users.submitAnswer', submitAnswer).then(
	  function (reg) {
		 console.log('.users.submitAnswer registered');
	  },
	  function (err) {
		 console.log('.users.submitAnswer failed in registration', err);
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

  
  //setInterval(question(session), 30*1000);
  setTimeout(question(session), 2000);
  setInterval(pubUpdates(session, 2 * 1000));
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

	  var update = {
		userName : appliedUserName,
		action   : "Just Joined",
	  }
	  userBehaviorUpdates.push(update);

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
	var questions = require('./languages_and_quotes.js');

	var intermCitiesNum = 5;

	var retFunc = function() {

		console.log('generate question')
		try {
			
			var question = questions.getQuestion(intermCitiesNum);

			var onResponse = function() {
			
				var resBundle = {
					option0 : null,
					option1 : null,
				}

				return function(qNum, translatedText) {

					if (qNum === 0) {
						resBundle.option0 = translatedText
					} else {
						resBundle.option1 = translatedText
					}

					if (resBundle.option0 !== null && resBundle.option1 !== null) {

						//The following block is a pre-test that ensure the original text
						// and two translations are all different.
						if (resBundle.option0 ===  question.seed3 
							|| resBundle.option1 === question.seed3
							|| resBundle.option0 === resBundle.option1) {

							retFunc();
							return;
						}


						var ret = {};
						ret.gameType = question.gameType;
						ret.seeds = [question.seed1, question.seed2, question.seed3];
						ret.results = [resBundle.option0, resBundle.option1];
						ret.answer = 0; //Replace by a random number

						session.publish('edu.cmu.ipd.rounds.newRound', [ret], {}, {acknowledge: true}).then(
							function(publication) {
								console.log("published new round, publication ID is ", publication);
							},
							function(error) {
								console.log("failed to publish new round ", error);
							});
						// console.log(ret);
						currBundle = ret;

                        setTimeout(answer(session, ret), 30*1000);

					}
				}
			}();
			
			answers.getAnswer(0, question.seed1, 0, question.seed3, onResponse);
			answers.getAnswer(1, question.seed2, 0, question.seed3, onResponse);
		} catch (exception) {
			console.log(exception);
		}

	}
	return retFunc;
}

var answer = function(session, answer) {
    return function() {
	session.publish('edu.cmu.ipd.rounds.newAnswer', [answer], {}, {acknowledge: true}).then(
		function(publication) {
			console.log("published new answer, publication ID is ", publication);
		},
		function(error) {
			console.log("failed to publish new answer ", error);
		});
        setTimeout(question(session), 10*1000);
    }
} 

var getCurrentRound = function(args){
  return [currBundle]
}

var topN = function(session) {
  
  return function(args) {
	N = args[0];
	// console.log('[backend]topN: called');
	onLeaderBoardReady = function(param) {
	  session.publish('edu.cmu.ipd.leaderboard.request', param, {}, { acknowledge: true}).then(
		function(publication) {
		  console.log("leaderboard published with ID: " + publication.id);
		},
		function(error) {
		  console.log('leaderboard published with error', error);
		});
	}
	model.getTopNUsers(N, onLeaderBoardReady);
  }
}

var submitAnswer = function(args) {
  
  var update = {
	userName : args[0],
	action   : args[1],
  }

  userBehaviorUpdates.push(update);

}

var pubUpdates = function(session) {

  return function() {
	
	if(userBehaviorUpdates.length > 0) {
	  session.publish('edu.cmu.ipd.updates.newUpdate', userBehaviorUpdates, {}, { acknowledge: true}).then(
		function(publication) {
		  console.log(".updates.newUpdate published with ID ", publication);
		},
		function(error) {
		  console.log(".updates.newUpdate publication error", error);
		});
	  userBehaviorUpdates = [];
	}

  }
}



connection.open();
