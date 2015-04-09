

exports.getQuestion = function () {
    
    var quoteIdx = 0;

    return function(len) {
        var prev = [];
        var question = {
            gameType: 'translator',
            seed1: getRandomCities(len, prev), // Path 1
            seed2: getRandomCities(len, prev), // Path 2
            seed3: quotes[quoteIdx]  // Quote
        }
        quoteIdx = (quoteIdx + 1) % quotes.length;
        return question;
    }
}()


Array.prototype.getRandom = function(previous) {
    
    if (this.length == 0) {
        return null;
    } else if (this.length == 1) {
        return this[0];
    } else {
        var num = 0;
        var lan = null;
        do {
            num = Math.floor(Math.random() * this.length);
            lan = cities[num].language_code;
            // console.log(previous);
            // console.log(lan);
        } while (previous.contains(lan));
        previous.push(lan);
        return this[num];
    }
};

var cities = [
    {city: "Beijing",         language: "Mandarin",   language_code: "zh-CN", lat: 39.9388,  lng: 116.3974 },
    {city: "Delhi",           language: "Hindi",      language_code: "hi",    lat: 28.6454,  lng: 77.0907  },
    {city: "Madrid",          language: "Spanish",    language_code: "es",    lat: 40.4378,  lng: -3.6795  },
    // {city: "Washington, D.C", language: "English",    language_code: "en",    lat: 38.8993,  lng: -77.0145 },
    {city: "Abu Dhabi",       language: "Arabic",     language_code: "ar",    lat: 24.3865,  lng: 54.5599  },
    {city: "Lisbon",          language: "Portugese",  language_code: "pt",    lat: 38.7436,  lng: -9.1602  },
    {city: "Moscow",          language: "Russian",    language_code: "ru",    lat: 55.7497,  lng: 37.6324  },
    {city: "Tokyo",           language: "Japanese",   language_code: "ja",    lat: 35.6833,  lng: 139.6833 },
    {city: "Berlin",          language: "German",     language_code: "de",    lat: 52.5167,  lng: 13.3833  },
    {city: "Jakarta",         language: "Javanese",   language_code: "id",    lat: -6.2297,  lng: 106.8295 },
    {city: "Seoul",           language: "Korean",     language_code: "ko",    lat: 37.5651,  lng: 126.9895 },
    {city: "Hanoi",           language: "Vietnamese", language_code: "vi",    lat: 21.0226,  lng: 105.8369 },
    {city: "Paris",           language: "French",     language_code: "fr",    lat: 48.8588,  lng: 2.3470   },
    {city: "Islamabad",       language: "Urdu",       language_code: "ur",    lat: 33.6780,  lng: 72.9849  },
    {city: "Rome",            language: "Italian",    language_code: "it",    lat: 41.9100,  lng: 12.5359  },
    {city: "Ankara",          language: "Turkish",    language_code: "tr",    lat: 39.9033,  lng: 32.7678  },
    {city: "Tehran",          language: "Persian",    language_code: "fa",    lat: 35.7014,  lng: 51.3498  },
    {city: "Warsaw",          language: "Polish",     language_code: "pl",    lat: 52.2329,  lng: 21.0611  },
    {city: "Kiev",            language: "Ukranian",   language_code: "uk",    lat: 50.4020,  lng: 30.5326  },
    {city: "Bangkok",         language: "Thai",       language_code: "th",    lat: 13.7246,  lng: 100.6331 },
    {city: "Tunis",           language: "Arabic",     language_code: "ar",    lat: 36.7948,  lng: 10.1432  },
    {city: "Buenos Aires",    language: "Spanish",    language_code: "es",    lat: -34.6158, lng: -58.4332 },
    {city: "Sofia",           language: "Bulgarian",  language_code: "bg",    lat: 42.6954,  lng: 23.3239  },
    {city: "Oslo",            language: "Norwegian",  language_code: "no",    lat: 59.8938,  lng: 10.7851  },
    {city: "Brazzaville",     language: "Swahili",    language_code: "sw",    lat: -4.2471,  lng: 15.2272  },
    {city: "Singapore",       language: "Malay",      language_code: "ms",    lat: 1.3147,   lng: 103.8470 },
    {city: "Windhoek",        language: "Afrikaans",  language_code: "af",    lat: -22.5632, lng: 17.0707  },
    {city: "Skopje",          language: "Macedonian", language_code: "mk",    lat: 19.7469,  lng: 96.0844  },
];

// Set London as the start and end cities.
var start_end_City = {city: "London", language: "English", language_code: "en", lat: 51.5072,  lng: -0.1275  }
;

var quotes = [
    "If you are here - who is running hell?",
    "Artificial intelligence is no match for natural stupidity",
    "The only substitute for good manners is fast reflexes",
    "Support bacteria - they're the only culture some people have",
    "Letting the cat out of the bag is a whole lot easier than putting it back in",
    "Well, here I am! What are your other two wishes",
    "Treat each day as your last; one day you will be right",
    "Red meat is not bad for you. Fuzzy green meat is bad for you",
    "The early bird may get the worm, but the second mouse gets the cheese",
    "Isn't it scary that doctors call what they do \"practice\"",
    "All power corrupts. Absolute power is pretty neat, though",
    "Always remember you're unique, just like everyone else",
    "Everybody repeat after me: \"We are all individuals.\"",
    "Confession is good for the soul, but bad for your career",
    "A bartender is just a pharmacist with a limited inventory",
    "Bombs don't kill people, explosions kill people",
    "Bureaucrats cut red tape, lengthwise",
    "Help stamp out, eliminate and abolish redundancy!",
    "How many of you believe in telekinesis? Raise MY hand!",
    "Very funny, Scotty. Now beam down my clothes...",
    "The problem with trouble shooting is that trouble shoots back",
    "Take my advice — I'm not using it",
    "Ever stop to think, and forget to start again",
    "I started with nothing, and I still have most of it",
    "I would like to slip into something more comfortable - like a coma"
];

Array.prototype.contains = (function(obj) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == obj) { 
            return true;
        }
    }
    return false;
}
);


var getRandomCities = function (len, prev) {
    var randomCities = [];
    // var prev = [];
    randomCities.push(start_end_City);
    for (var i = 0; i < len; i++){
        var c = cities.getRandom(prev);
        randomCities.push(c);
    }
    randomCities.push(start_end_City);
    // console.log(randomCities);
    return randomCities;
}
