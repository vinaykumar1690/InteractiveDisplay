var question = function(session) {
    
    var commHandler = session;
    var answers = require('./getAnswer.js');
    var questions = require('./languages_and_quotes.js');

    var intermCitiesNum = 5;

    return function() {

        var question = questions.getQuestion(intermCitiesNum);

        var onResponse = function() {
        
            var resBundle = {
                option0 : null,
                option1 : null,
            }

            return function(qNum, translatedText) {
                console.log('CALLBACK IS CALLED.');
                if (qNum === 0) {
                    resBundle.option0 = translatedText
                } else {
                    resBundle.option1 = translatedText
                }

                if (resBundle.option0 !== null && resBundle.option1 !== null) {
                    
                    var ret = {};
                    ret.seeds = [question.seed1, question.seed2, question.seed3, intermCitiesNum];
                    ret.results = [resBundle.option0, resBundle.option1];
                    ret.answer = 0; //Replace by a random number

                    // session.publish('edu.cmu.ipd.rounds.newRound', [ret], {}, {acknowledge: true}).then(
                    //     function(publication) {
                    //         console.log("published new round, publication ID is ", publication);
                    //     },
                    //     function(error) {
                    //         console.log("failed to publish new round ", error);
                    //     });
                    console.log(ret);
                }
            }
        }();

        // console.log(question.seed1);
        // console.log(question.seed3);
        
        answers.getAnswer(0, question.seed1, 0, question.seed3, onResponse);
        answers.getAnswer(1, question.seed2, 0, question.seed3, onResponse);

    }
}(null)();