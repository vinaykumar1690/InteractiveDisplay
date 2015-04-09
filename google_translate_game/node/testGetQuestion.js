var attestSingleArray = function(array) {
	for (var i = 0; i < array.length - 1; i++) {
		for (var j = i+1; j < array.length; j++) {
			if (array[i].language_code === array[j].language_code && (i !== 0 && j !== 6)) {
				console.log('Single array failure: [' + i + ']' + array[i].language_code + ' equals to [' + j + ']' + array[j].language_code);
				return false;
			}
		}
	}
	return true;
}

var attestDoubleArrays = function(array1, array2) {
	
	if (!attestSingleArray(array1) || !attestSingleArray(array2)) {
		return false;
	}

	for (var i = 1; i < array1.length - 1; i++) {
		for (var j = 1; j < array2.length - 1; j++) {
			if (array1[i].language_code === array2[j].language_code) {
				return false;
			}
		}
	}
	return true;
}

var question = function() {
  
  // var answers = require('./getAnswer.js');
  var questions = require('./languages_and_quotes.js');
  // console.log('question closure called.');

  return function() {
    
    for (var i = 0; i < 1000000; i++) {
	    
	    question = questions.getQuestion(5);

	   	if(!attestDoubleArrays(question.seed1, question.seed2)) {
	   		console.log('Failed attest.');
	   		return;
	   	}
	}

	console.log('Pass the attest.');
	return;
  }
}()();


