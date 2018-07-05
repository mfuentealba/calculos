'use strict'

setInterval(fnOrionx, 10000);



async function fnOrionx(){
	let query = {                        
		query: '{marketOrderBook(marketCode: "CHABTC", limit:20){buy{limitPrice amount accumulated} sell{limitPrice amount accumulated} spread}}'
	};

	var libroOrion = await main(query);
	
	console.log(libroOrion);
	
	var secret = 'tTiQAtoIJRAttGNbFBElwrCUmvdrwqBoPSjvucrYGJFJJkjPWU';

	
	//try {

	  // URLs para consulta y formación de links
	  var URL = 'https://www.southxchange.com/api/book/CHA/BTC';
	  
	  
		var respJSON;
	  
		
		// Realiza la petición
		var http = require('https');
		//console.log(URL);
		var peticion = http.get(URL, function(respuesta) {
		
		  
		  var cancionesJSON = '';
		  respuesta.on('data', function(respuestaJSON) {
			respJSON += respuestaJSON;
		  });

		  // Una vez finalizada la respuesta se procesa
		  respuesta.on('end', function() {
			  
			//var data = JSON.parse(respJSON); 
			
			//console.log(respJSON);
			
			
			
		  });

		}).on('error', function(error) {
		  // Ocurrió un error en el request
		  console.log('Error encontrado al realizar la consulta: ' + error.message);
		});
	
	
}



// Código creado por AAPABLAZA con base en código de Orionx.io
const JSSHA = require('jssha');
const fetch = require('node-fetch');

// Creating SHA-OBJ


/**
 * FullQuery() execs queries to an url with a query body, apiKey and secretKey.
 * @param {String} url Url of the Orionx.io API GraphQL
 * @param {String} query GraphQL Query
 * @param {String} apiKey Personal Api Key from Orionx.io
 * @param {String} apiSecretKey Personal Secret Api Key from Orionx.io
 * @return {Object} JS object
 */
async function fullQuery(url, query, apiKey, apiSecretKey) {
  // New actual Time-Stamp
  var date = new Date();
  //console.log(date);
  //date.setUTCHours(date.getHours());
  /*console.log(date);
  console.log(date.getHours());
  console.log(date.getTime());*/
  let timeStamp = date.getTime()/* / 1000*/;

  // Operating info of shaObj
  const shaObj = new JSSHA('SHA-512', 'TEXT');
  shaObj.setHMACKey(apiSecretKey, 'TEXT');
  let body = JSON.stringify(query);
  shaObj.update(timeStamp + body);
  let signature = shaObj.getHMAC('HEX');

  // Sending request
  try {
    let res = await fetch(url, {            // Consulta tipo POST.
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ORIONX-TIMESTAMP': timeStamp,
        'X-ORIONX-APIKEY': apiKey,
        'X-ORIONX-SIGNATURE': signature,
        'Content-Length': body.length,
      },
      body,                                 // Cuerpo del Mensaje (query)
    });
    return res.json();
  } catch (e) {
    throw(e);
  }
}

/**
 * main() prints the result of a GraphQL query to Orionx.io
 * @param {String} query GraphQL query string
 */
async function main(query) {
  try {
    let res = await fullQuery(
      'http://api2.orionx.io/graphql',   // Dirección de la API de Orionx
      query,                            // query creada
      'pTKevkzTuLyMZ5Y4YntQ2LxxeoG7Se72w5',                      // Aquí va la API Key
      'ThGo2TXsebZTHSvdhgBHeY6tjoT7bYMvYY'                // Aquí va la Secret API Key
    );

    console.log('*** Response ***');    // Se imprime la respuesta que llega
    //console.log(res);
	return res;
  } catch (e) {
    throw(e);
  }
}

/* Basic GrapghQL Query */
   

let mutation = {                        
    query: 'mutation {placeLimitOrder(marketCode: "CHABTC", amount:100000000, limitPrice: 1000, sell:false){_id __typename }}'
  
  };
//main(mutation);
