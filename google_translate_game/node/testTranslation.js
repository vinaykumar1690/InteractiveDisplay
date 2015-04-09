var languages_and_quotes = require('./languages_and_quotes.js');
var translate = require('./getAnswer.js');

var question = languages_and_quotes.getQuestion(3);


var cities = [ 
  { city: 'Washington, D.C',
    language: 'English',
    language_code: 'en',
    lat: 38.8993,
    lng: -77.0145 },
  { city: 'Buenos Aires',
    language: 'Spanish',
    language_code: 'es',
    lat: -34.6158,
    lng: -58.4332 },
  { city: 'Beijing',
    language: 'Mandarin',
    language_code: 'zh-CN',
    lat: 39.9388,
    lng: 116.3974 },
  { city: 'Ankara',
    language: 'Turkish',
    language_code: 'tr',
    lat: 39.9033,
    lng: 32.7678 },
  { city: 'Washington, D.C',
    language: 'English',
    language_code: 'en',
    lat: 38.8993,
    lng: -77.0145 } 
];

var text = 'Well, here I am! What are your other two wishes';
// console.log(cities);
//translate.getTranslation(question.seed1, 0, question.seed3);
translate.getAnswer(0, cities, 0, text, function(qNum, translatedText) {
    console.log('[' + qNum + ']:' + translatedText);
});
