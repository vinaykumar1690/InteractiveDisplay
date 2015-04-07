var https = require('https');

exports.getTranslation = (function() {
    
    var cCities = null;
    var cIndex = null;

    var onIntermediateResponse = function(res) {
        
        res.setEncoding('utf8');
        
        var responseBody = "";
        res.on('data', function(d) {
            responseBody += d;
        });

        res.on('end', function() {
            responseBody = JSON.parse(responseBody);
            var translatedText = responseBody.data.translations[0].translatedText;
            console.log(translatedText);
            translate(cCities, cIndex+1, translatedText);
        });
    }

    var onFinalResponse = function(res) {
        res.setEncoding('utf8');
        
        var responseBody = "";
        res.on('data', function(d) {
            responseBody += d;
        });

        res.on('end', function() {
            responseBody = JSON.parse(responseBody);
            var translatedText = responseBody.data.translations[0].translatedText;
            console.log(translatedText);
        });
    }

    var translate =  function(cities, index, text) {

        cIndex = index;
        cCities = cities;

        if (index+1 === cities.length) {
            console.log('getTranslation called with index '+ index +' but length of array is '+cities.length);
            return;
        }

        var source = cities[index].language_code;
        var target = cities[index+1].language_code;

        var onError = function(err) {
            console.log('err');
        }

        var options = {
            hostname: 'www.googleapis.com',
            port: 443,
            path: encodeURI('/language/translate/v2?key=AIzaSyALWxgT7ALon32ohU5-fB-IWbmzbwSIDmg&source='+ source +'&target='+ target +'&q='+text),
            method: 'GET'
        }

        console.log("url:" + "https://" + options.hostname + options.path);
        
        var req = null;
        if (target === 'en')
            req = https.request(options, onFinalResponse);
        else
            req = https.request(options, onIntermediateResponse);

        req.on('error', onError);

        req.end();
    }

    return translate;
})();
