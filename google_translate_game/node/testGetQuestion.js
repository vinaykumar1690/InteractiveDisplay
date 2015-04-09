var question = function() {
  
  var answers = require('./getAnswer.js');
  var questions = require('./languages_and_quotes.js');
  console.log('question closure called.');

  return function() {

    console.log('question called');
    
    question = questions.getQuestion(5);

    console.log(question);
  }
}()();