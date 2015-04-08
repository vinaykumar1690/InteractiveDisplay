var https = require('https');

exports.getAnswer = function() {

    var onIntermediateResponse = function(qNum, index, cities, callback) {

        return function(res) {
        
            res.setEncoding('utf8');
            
            var responseBody = "";
            res.on('data', function(d) {
                responseBody += d;
            });

            res.on('end', function() {
                responseBody = JSON.parse(responseBody);
                try {
                    var translatedText = responseBody.data.translations[0].translatedText;
                    translate(qNum, cities, index+1, translatedText, callback);
                } catch (exception) {
                    console.log(exception);
                    console.log(responseBody);
                }
                // console.log('[' + qNum + ']' + translatedText);
                
            });
        }
    }

    var onFinalResponse = function(qNum, callback) {
        
        return  function(res) {
            res.setEncoding('utf8');
            
            var responseBody = "";
            res.on('data', function(d) {
                responseBody += d;
            });

            res.on('end', function() {
                responseBody = JSON.parse(responseBody);
                try {
                    var translatedText = responseBody.data.translations[0].translatedText;
                    console.log('[' + qNum + ',final]' + translatedText);
                    callback(qNum, translatedText);
                } catch (exception) {
                    console.log(exception);
                    console.log(responseBody);
                }
                
            });
        }
    }

    var translate =  function(qNum, cities, index, text, callback) {
        
        console.log('[' + qNum +',' + index + '/' + cities.length +'] has started.');

        if (index+1 === cities.length) {
            // console.log('getTranslation called with index '+ index +' but length of array is '+cities.length);
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

        // console.log("url:" + "https://" + options.hostname + options.path);
        
        var req = null;
        if (target === 'en')
            req = https.request(options, onFinalResponse(qNum, callback));
        else
            req = https.request(options, onIntermediateResponse(qNum, index, cities, callback));

        req.on('error', onError);

        req.end();
    }

    return translate;
}();
