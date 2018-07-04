/**
 * Clave: uUVmpIxtbxJWMrNOrOBkXXWKPXnJdh

Secreto: tTiQAtoIJRAttGNbFBElwrCUmvdrwqBoPSjvucrYGJFJJkjPWU
 */

//P5Kc7UjcwjTHe8bg6dT9yr1g3kvVj1sw74ogyYHdst7z5h7cNfEP


'use strict'

var secret = 'tTiQAtoIJRAttGNbFBElwrCUmvdrwqBoPSjvucrYGJFJJkjPWU';

	
	//try {

	  // URLs para consulta y formación de links
	  var URL = 'https://www.southxchange.com/api/book/CHA/BTC';
	  
	  
		var respJSON;
	  
		
		// Realiza la petición
		var http = require('https');
		//console.log(URL);
		/*var peticion = http.get(URL, function(respuesta) {
		
		  
		  var cancionesJSON = '';
		  respuesta.on('data', function(respuestaJSON) {
			respJSON += respuestaJSON;
		  });

		  // Una vez finalizada la respuesta se procesa
		  respuesta.on('end', function() {
			  
			//var data = JSON.parse(respJSON); 
			
			console.log(respJSON);
			
			
			
		  });

		}).on('error', function(error) {
		  // Ocurrió un error en el request
		  console.log('Error encontrado al realizar la consulta: ' + error.message);
		});*/
		//var request = require('request');
		
		
		var request = require('request');
		
		const crypto = require('crypto');
				
		const hmac = crypto.createHmac('sha512', secret);
		
		//console.log(hmac);
		
		var date = new Date;
		
		var nonce = date.getTime();
		
		var req = {nonce: nonce, key: 'uUVmpIxtbxJWMrNOrOBkXXWKPXnJdh', listingCurrency: 'CHA', referenceCurrency: 'BTC', type: 'buy', amount: 0.004, limitPrice: 0.00004}
		
		//console.log(req);
		
		var hash = hmac.update(JSON.stringify(req), 'utf8').digest('hex');
		
		console.log(hash);
		
		var headers = {
			//'User-Agent':       'Super Agent/0.0.1',
			'Content-Type':     'application/json',
			'Hash': 			hash//createToken()
		}
		
		var options = {
			url     : 'https://www.southxchange.com/api/placeOrder',
			method  : 'POST',
			//jar     : true,
			headers : headers,
			json : true,
			body:	req//JSON.stringify(req)
		}
		
		
		
		
		
		request.post(options, function(err,httpResponse,body) {
			console.log(err);
			console.log(httpResponse);
			console.log(body);
		}).on('error', function(error) {
		  // Ocurrió un error en el request
		  console.log('Error encontrado al realizar la consulta: ' + error.message);
		});
		
		/*var peticion2 = http.request(options, req, function(respuesta) {
		
		
		
		  
		  var cancionesJSON = '';
		  respuesta.on('data', function(respuestaJSON) {
			respJSON += respuestaJSON;
		  });

		  // Una vez finalizada la respuesta se procesa
		  respuesta.on('end', function() {
			  
			//var data = JSON.parse(respJSON); 
			
			console.log(respJSON);
			
			
			
		  });

		}).on('error', function(error) {
		  // Ocurrió un error en el request
		  console.log('Error encontrado al realizar la consulta: ' + error.message);
		});*/
		

	  
	/*}
	  catch(err) {
	  console.log('Error inesperado:');
	  console.log('\t' + err);
	}*/	
		



	






