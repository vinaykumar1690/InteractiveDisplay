//Put the backend js file here
var autobahn = require('autobahn');

var when = require('when');

var model = require('../../db/model.js');

var question = require('./cities_and_types.js');

var connection = new autobahn.Connection({
	url: 'ws://127.0.0.1:80/ws',
	realm: 'realm1'
});

connection.onopen = function(session){

	console.log('google places node connected.');

	session.register('edu.cmu.ipd.users.createUser', createUser(session)).then(
      function (reg) {
         console.log('./users.createUser registered');
      },
      function (err) {
         console.log('./users.createUser failed in registration', err);
      });

  setInterval(question(session), 20*1000);



}

/*
 * createUser is a closure of session.
 * return 	: a RPC call that for registration call, 
 */
var createUser = function(session) {
	
	var onCreatedUser = function(token) {
		var userNameToken = token;
		return function(appliedUserName) {
			session.publish('edu.cmu.ipd.users.onCreatedUser', [userNameToken, appliedUserName]);
		}
	}

	var userToken = 0;
	return function (args) {
		userToken++;
		console.log('[backend] createUser: called');
		try {
			model.createUser(args[0], onCreatedUser(userToken));
		} catch (err) {
			console.log(err.message);
		}
		console.log('[backend] createUser: finished');
		return [userToken];
	}
}


var question = function(session) {
  
  var commHandler = session;
  var answers = require('./getAnswer.js');
  var questions = require('./cities_and_types.js');

  return function() {
    
    var onResponse = function() {

      var bundle = {
        option0 : null,
        option1 : null,
      }

      return function (opt) {
        
        return function(res) {
          res.setEncoding('utf8');

          responseBody = "";

          res.on('data', function(d) {
            responseBody += d;
          });

          res.on('end', function() {
            responseBody = JSON.parse(responseBody);
            if (opt === 0) {
              bundle.option0 = responseBody.results.length;
              if (bundle.option1 !== null) {
                console.log('from opt0: ' + bundle);
              }
            } else if (opt === 1) {
              bundle.option1 = responseBody.results.length;
              if (bundle.option0 !== null) {
                console.log('from opt1: ' + bundle);
              }
            }
          });
        }
      }
    }();

    var onError = function(err) {
      console.log('err');
    }
    
    question = questions.getQuestion();
    answers.getAnswer(0, question.city1.lat ,question.city1.lng, 2 * 1000, question.type, onResponse, onError, null);
    answers.getAnswer(1, question.city2.lat ,question.city2.lng, 2 * 1000, question.type, onResponse, onError, null);
  }
}

connection.open();