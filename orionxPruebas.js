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
	
	//console.log(res.data.marketOrderBook.sell);
	console.log(res.data);
	/*for(let obj of res.data.marketOrderBook.buy){
		obj.limitPrice = obj.limitPrice / 100000000;
		obj.amount = obj.amount / 100000000;
		obj.accumulated = obj.accumulated / 100000000;
		console.log(obj);
	}*/

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
  query: `query getUserWallets {
me {
  _id
  country {
    code
    __typename
  }
  wallets {
    currency {
      code
      __typename
    }
    ...walletListItem
    __typename
  }
  __typename
}
}

fragment walletListItem on Wallet {
_id
balance  
availableBalance
unconfirmedBalance  
}`
};


  
 // main(query2);
  
  
/*  let query3 = {                        
		query: `{
  history: marketTradeHistory(marketCode: "CHABTC",limit:500) {
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
		query: `{
  orders(marketCode: "CHABTC", onlyOpen: false, limit: 10) {
    totalCount
    items {
      _id
      sell
      type
      amount
      amountToHold
      secondaryAmount
      filled
      secondaryFilled
      limitPrice
      createdAt
      isStop
      status
      stopPriceUp
      stopPriceDown
 
      __typename
    }
    __typename
  }
}
`
	};
 //main(query3);
 
 
 
 
 


//main(query);   

let mutation = {                        
    query: 'mutation {ini: placeLimitOrder(marketCode: "CHACLP", amount:100000000, limitPrice: 498, sell:true){_id __typename }, otra: placeLimitOrder(marketCode: "CHACLP", amount:500000000000, limitPrice: 498, sell:true){_id __typename }}'
  
  };
main(mutation);
