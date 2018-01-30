 
          // URLs para consulta y formación de links
          var http = require("https");
          var options = {
            host: 'https://www.southxchange.com',
            //port: 80,
            path: '/api/listOrders',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Hash': "tTiQAtoIJRAttGNbFBElwrCUmvdrwqBoPSjvucrYGJFJJkjPWU"
            }
          };
          var req = http.request(options, function(res) {
            console.log('Status: ' + res.statusCode);
            console.log('Headers: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (body) {
              console.log('Body: ' + body);
            });
          });
          req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
            console.log(e);
          });
          // write data to request body
          //req.write('{"nonce": "1", "key": "uUVmpIxtbxJWMrNOrOBkXXWKPXnJdh", "listingCurrency": "CHA", "referenceCurrency": "BTC", "type": "buy", "amount":"20", "limitPrice": "0.00001"}');
          req.write('');
          req.end();