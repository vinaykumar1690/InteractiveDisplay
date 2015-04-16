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

                // console.log('STATUS: ', res.statusCode);
                // console.log(responseBody);

                try {
                    responseBody = JSON.parse(responseBody);
                    var translatedText = responseBody.data.translations[0].translatedText;
                    translatedText = htmlEnDeCode.htmlDecode(translatedText);
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
                
                // console.log('STATUS: ', res.statusCode);
                // console.log(responseBody);

                
                try {
                    responseBody = JSON.parse(responseBody);
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
        
        console.log('[' + qNum +',' + index + '/' + cities.length +'] has started: ' + text);

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
            path: encodeURI('/language/translate/v2?key=AIzaSyALWxgT7ALon32ohU5-fB-IWbmzbwSIDmg&source='+ source +'&target='+ target +'&q='+ text),
            method: 'GET',
            headers: {
                Accept: 'application/json',
            }
        }

        console.log("url:" + "https://" + options.hostname + options.path);
        
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


var htmlEnDeCode = (function() {
    var charToEntityRegex,
        entityToCharRegex,
        charToEntity,
        entityToChar;

    function resetCharacterEntities() {
        charToEntity = {};
        entityToChar = {};
        // add the default set
        addCharacterEntities({
            '&amp;'     :   '&',
            '&gt;'      :   '>',
            '&lt;'      :   '<',
            '&quot;'    :   '"',
            '&#39;'     :   "'"
        });
    }

    function addCharacterEntities(newEntities) {
        var charKeys = [],
            entityKeys = [],
            key, echar;
        for (key in newEntities) {
            echar = newEntities[key];
            entityToChar[key] = echar;
            charToEntity[echar] = key;
            charKeys.push(echar);
            entityKeys.push(key);
        }
        charToEntityRegex = new RegExp('(' + charKeys.join('|') + ')', 'g');
        entityToCharRegex = new RegExp('(' + entityKeys.join('|') + '|&#[0-9]{1,5};' + ')', 'g');
    }

    function htmlEncode(value){
        var htmlEncodeReplaceFn = function(match, capture) {
            return charToEntity[capture];
        };

        return (!value) ? value : String(value).replace(charToEntityRegex, htmlEncodeReplaceFn);
    }

    function htmlDecode(value) {
        var htmlDecodeReplaceFn = function(match, capture) {
            return (capture in entityToChar) ? entityToChar[capture] : String.fromCharCode(parseInt(capture.substr(2), 10));
        };

        return (!value) ? value : String(value).replace(entityToCharRegex, htmlDecodeReplaceFn);
    }

    resetCharacterEntities();

    return {
        htmlEncode: htmlEncode,
        htmlDecode: htmlDecode
    };
})();