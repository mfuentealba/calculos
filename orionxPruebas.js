// Código creado por AAPABLAZA con base en código de Orionx.io
const JSSHA = require('jssha');
const fetch = require('node-fetch');
var dateFormat = require('dateformat');
const crypto = require('crypto');
var request = require('request');

// Creating SHA-OBJ
const shaObj = new JSSHA('SHA-512', 'TEXT');
var secretSouth = 'tTiQAtoIJRAttGNbFBElwrCUmvdrwqBoPSjvucrYGJFJJkjPWU';

function fnHeader(req){
				
	const hmac = crypto.createHmac('sha512', secretSouth);	
	var hash = hmac.update(JSON.stringify(req), 'utf8').digest('hex');	
	return {
		//'User-Agent':       'Super Agent/0.0.1',
		'Content-Type':     'application/json',
		'Hash': 			hash//createToken()
	}
}



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
  console.log(date);
  //date.setUTCHours(date.getHours());
  console.log(date);
  console.log(date.getHours());
  console.log(date.getTime());
  let timeStamp = date.getTime()/* / 1000*/;

  // Operating info of shaObj
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
	//console.log(res.data.marketOrderBook);
    /*for(let obj of res.data.history){
		let d = new Date(obj.date);// - 14400000)
		
		console.log(dateFormat(d, "yyyy/mm/dd  HH:MM:ss") + ', price: ' + (obj.price / 100000000) + ', amount: ' + (obj.amount / 100000000));
	}*/
	
	
	for(let obj of res.data.marketOrderBook.buy){
		obj.limitPrice = obj.limitPrice / 100000000;
		obj.amount = obj.amount / 100000000;
		obj.accumulated = obj.accumulated / 100000000;
		console.log(obj);
	}

  } catch (e) {
    throw(e);
  }
}

/* Basic GrapghQL Query */
let query = {                        
    query: `{market(code: "CASHBTC"){
    lastTrade{
      price
    }
  }}
`};

let query2 = {                        
		query: `{wallets(userId:"RwbP7oG97zoLShK6H") {
      _id
      
}}`
  };

/*
let query3 = {                        
		query: `{
  history: marketTradeHistory(marketCode: "BCHBTC") {
    _id
    amount
    price
    date
    __typename
  }
}`
  };
  
  
  let query3 = {                        
		query: `{
  history: marketTradeHistory(marketCode: "BCHBTC") {
    _id
    amount
    price
    date
    __typename
  }
}`
  };
  */
  
  let query3 = {                        
		query: '{marketOrderBook(marketCode: "CHABTC", limit:100){buy{limitPrice amount accumulated} sell{limitPrice amount accumulated} spread}}'
	};
 main(query3);
 
 
 
 
 


//main(query);   

let mutation = {                        
    query: 'mutation {placeLimitOrder(marketCode: "CHABTC", amount:100000000, limitPrice: 1000, sell:false){_id __typename }}'
  
  };
//main(mutation);
