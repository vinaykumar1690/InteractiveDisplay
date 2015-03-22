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
      }
   );

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

/*
Generate a question and publish to frontend (display)
*/
   
    // Publish the question
    var requestQuestion = function(args) {
        // session.publish('edu.cmu.ipd.types', [types.getRandom()]);
        session.publish('edu.cmu.ipd.question', [question.getQuestion()]);
    }

    session.subscribe("edu.cmu.ipd.reqQuestion", requestQuestion).then(
      function (sub) {
         console.log('subscribed to .reqQuestion');
      },
      function (err) {
         console.log('failed to subscribe to .reqQuestion', err);
      });
    
 	var requestResult = function(args) {
        //typeTimer = setTimeout(issueType, 5000);
        var result = {};
    }
    session.register('edu.cmu.ipd.reqResult', requestResult).then(
    function (reg) {
       console.log('reqResult registered');
    },
    function (err) {
       console.log('failed to register reqResult', err);
    });

connection.open();