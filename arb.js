'use strict'
const JSSHA = require('jssha');
const fetch = require('node-fetch');

const crypto = require('crypto');
var request = require('request-promise');
var fs = require('fs');
var arrOrionBuyCHABTC;
var arrOrionSellCHABTC;
var arrOrionBuyBTCCLP;
var arrOrionSellBTCCLP;
var arrOrionBuyCHACLP;
var arrOrionSellCHACLP;
var tradesOrionCHABTC;
var tradesOrionCHACLP;

var balanceSouth;
var calcBalance = 0;	
var indexBalance = {precios:[]};
var arrSouthBuyCHABTC;
var arrSouthSellCHABTC;
var orders;
var secretSouth = 'tTiQAtoIJRAttGNbFBElwrCUmvdrwqBoPSjvucrYGJFJJkjPWU';
var objTrades = {};
var balanceOrion;
var indexOrionBalance = {};
var orderOrion;
var tradesOrion;
var moment = require('moment');
console.log(moment());
var objLiq = {precios:[]};
var stopLoss = 0;
var filled = 0;

fs.readFile("./data.txt", 'utf8', function(err, data) {
	try{
		var arr = data.split("\n");
		//console.log(arr);
		for(let i of arr){
			console.log(i);
			if(i == ''){
			  break;
			}
			let obj = JSON.parse(i);
			objTrades[obj.Code] = obj;

		}	
	} catch(err){
		console.log(err);
	}
  
	fnProceso();
	setInterval(fnProceso, 20000);
  
});




function fnOrden(points) {
    points = points.sort(function(a, b){return a-b});
	points = points.reverse();
    
}



async function fnLibroSouth(){
	var URL = 'https://www.southxchange.com/api/book/CHA/BTC';  
	var respJSON = '';		
	// Realiza la petición
	
	//console.log(URL);
	await request.get(URL).then((data) => {	
		data = JSON.parse(data);
		//console.log(data);
		/*for(let obj of data){
			console.log(obj);
		}*/
		//console.log(data.BuyOrders);
		
		arrSouthBuyCHABTC = data.BuyOrders;
		arrSouthSellCHABTC = data.SellOrders;

		console.log(arrSouthSellCHABTC[0]);  
		console.log(arrSouthBuyCHABTC[0]);
		

		
	});	
}




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


function fnHeader(req){
				
	const hmac = crypto.createHmac('sha512', secretSouth);	
	var hash = hmac.update(JSON.stringify(req), 'utf8').digest('hex');	
	return {
		//'User-Agent':       'Super Agent/0.0.1',
		'Content-Type':     'application/json',
		'Hash': 			hash//createToken()
	}
}


function fnBalanceSouth(data){
		
		
	balanceSouth = data;
	
	try{
	  for(var i = 0; i < balanceSouth.length; i++){
		var obj = balanceSouth[i];
		
		indexBalance[obj.Currency] = obj;
	  }
	  console.log(indexBalance['BTC']);
	  calcBalance = indexBalance['BTC'].Available;
	  return;
	  //fnOrionx();
	} catch(err){
	  console.log(err);
	}
			
}

async function fnProceso(){
	console.log("*** NUEVA OPERACION ***");
  
	/******BALANCES******/
	console.log("******BALANCES******");
	var date = new Date;		
	var nonce = date.getTime();
	var req = {nonce: nonce + 14400000, key: 'uUVmpIxtbxJWMrNOrOBkXXWKPXnJdh'}	
	var headers = fnHeader(req);
	
	
	var options = {
		url     : 'https://www.southxchange.com/api/listBalances',
		method  : 'POST',
		//jar     : true,
		headers : headers,
		json : true,
		body:	req//JSON.stringify(req)
	}	
		
	/*await request.post(options).then((data) => {fnBalanceSouth(data)}).catch((error) => {
		  // Ocurrió un error en el request
		  console.log('Error encontrado al realizar la consulta: ' + error.message);
		});
	//console.log('FIN');
	
	await fnOrionxBalance();
	*/
	console.log("******FIN BALANCES******");
	
	/******FIN BALANCES******/
	
	
	/******LIBROS******/
	console.log("****LIBROS***");
	await fnLibrosOrion();
	await fnLibroSouth();
	console.log("****FIN LIBROS***");
	/******FIN LIBROS******/
	
	/******TRADES******/
	console.log("****TRADES***");
	await fnTradesOrion();
	console.log("****FIN TRADES***");
	
	/******FIN TRADES******/
	
	/******ORDENES******/
	console.log("****ORDENES***");
	await fnOrdenesOrion();
	await fnOrdenesSouth();
	
	console.log("****FIN ORDENES***");
	
	/******FIN ORDENES******/
	
	/******IGUALANDO LIBROS******/
	console.log("****IGUALANDO LIBROS***");
	
	for(let i = 0; i < arrOrionBuyCHABTC.length; i++){
		let obj = arrOrionBuyCHABTC[i];
		obj = {px: obj.limitPrice / 100000000, qty: obj.amount / 100000000, acum: obj.accumulated / 100000000};
		arrOrionBuyCHABTC[i] = obj;
		//console.log(obj);
	}
	console.log(arrOrionBuyCHABTC[0]);
	for(let i = 0; i < arrOrionSellCHABTC.length; i++){
		let obj = arrOrionSellCHABTC[i];
		obj = {px: obj.limitPrice / 100000000, qty: obj.amount / 100000000, acum: obj.accumulated / 100000000};
		arrOrionSellCHABTC[i] = obj;
	}
	
	for(let i = 0; i < arrOrionBuyCHACLP.length; i++){
		let obj = arrOrionBuyCHACLP[i];
		obj = {px: (obj.limitPrice / arrOrionSellBTCCLP[0].limitPrice).toFixed(8), qty: obj.amount / 100000000, acum: obj.accumulated / 100000000};
		arrOrionBuyCHACLP[i] = obj;
		//console.log(obj);
	}
	console.log(arrOrionBuyCHACLP[0]);
	
	
	for(let i = 0; i < arrOrionSellCHACLP.length; i++){
		let obj = arrOrionSellCHACLP[i];
		obj = {px: (obj.limitPrice / arrOrionSellBTCCLP[0].limitPrice).toFixed(8), qty: obj.amount / 100000000, acum: obj.accumulated / 100000000};
		arrOrionSellCHACLP[i] = obj;
	}
	var acum = 0;
	for(let i = 0; i < arrSouthBuyCHABTC.length; i++){
		let obj = arrSouthBuyCHABTC[i];
		acum += obj.Amount;
		obj = {px: obj.Price, qty: obj.Amount, acum: acum};
		arrSouthBuyCHABTC[i] = obj;
		//console.log(obj);
	}
	console.log(arrSouthBuyCHABTC[0]);
	acum = 0;
	
	for(let i = 0; i < arrSouthSellCHABTC.length; i++){
		let obj = arrSouthSellCHABTC[i];
		acum += obj.Amount;
		
		obj = {px: obj.Price, qty: obj.Amount, acum: acum};
		arrSouthSellCHABTC[i] = obj;
	}
	
	console.log("****FIN IGUALANDO LIBROS***");
	
	/******FIN IGUALANDO LIBROS******/
	
	
	
	/******MEJOR PRECIO******/
	console.log("****MEJOR PRECIO***");
	
	
	
	console.log("****FIN MEJOR PRECIO***");
	
	/******FIN MEJOR PRECIO******/
	
}

async function fnOrdenesSouth(){
	var date = new Date;			
	var nonce = date.getTime();  
	var req = {nonce: nonce + 14400000, key: 'uUVmpIxtbxJWMrNOrOBkXXWKPXnJdh'}  
	var headers = fnHeader(req);

	var options = {
	url     : 'https://www.southxchange.com/api/listOrders',
	method  : 'POST',
	//jar     : true,
	headers : headers,
	json : true,
	body:	req//JSON.stringify(req)
	}

	await request.post(options).then((data) => fnListOrders(data))	
}


function fnOrden(points) {
    points = points.sort(function(a, b){return a-b});
	points = points.reverse();
    
}


async function fnListOrders(body) {
	//body = JSON.parse(body);
  console.log(body);
  orders = body;
  
  
}



async function fnOrdenesOrion(){
	let query4 = {                        
		query: `{
  orders(marketCode: "CHABTC", onlyOpen: true, limit: 0) {
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
	
	orderOrion = await main(query4);
	orderOrion = orderOrion.data.orders.items;
	console.log(orderOrion);
	
	
	
	
  
	
	
}

async function fnTradesOrion(){
	let query3 = {                        
		query: `query{
  historyCHABTC: marketTradeHistory(marketCode: "CHABTC") {
    _id
    amount
    price
    date
    __typename
  }
  historyCHACLP: marketTradeHistory(marketCode: "CHACLP") {
    _id
    amount
    price
    date
    __typename
  }
}`
  };
	
	
	var data = await main(query3);
	
	console.log(data.data.historyCHABTC);
	
	tradesOrionCHABTC = data.data.historyCHABTC;
	
	
	tradesOrionCHACLP = data.data.historyCHACLP;
}

async function fnLibrosOrion(){
	let query = {                        
		query: `query{CHACLP: marketOrderBook(marketCode: "CHACLP", limit:100){buy{limitPrice amount accumulated} sell{limitPrice amount accumulated} spread}, 
		CHABTC: marketOrderBook(marketCode: "CHABTC", limit:100){buy{limitPrice amount accumulated} sell{limitPrice amount accumulated} spread},
		BTCCLP: marketOrderBook(marketCode: "BTCCLP", limit:100){buy{limitPrice amount accumulated} sell{limitPrice amount accumulated} spread}
		}`
	};

	var libroOrion = await main(query);	
	
	console.log(libroOrion);
	
	//for()
	arrOrionBuyCHABTC = libroOrion.data.CHABTC.buy;
	arrOrionSellCHABTC = libroOrion.data.CHABTC.sell;

	arrOrionBuyCHACLP = libroOrion.data.CHACLP.buy;
	arrOrionSellCHACLP = libroOrion.data.CHACLP.sell;	
	
	arrOrionBuyBTCCLP = libroOrion.data.BTCCLP.buy;
	arrOrionSellBTCCLP = libroOrion.data.BTCCLP.sell;	
	
	
	
	
	
	
	
}

async function fnOrionxBalance(){
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
  
  //console.log(await main(query2));
	balanceOrion = await main(query2);
	balanceOrion = balanceOrion.data;
	balanceOrion = balanceOrion.me;
	balanceOrion = balanceOrion.wallets;
	//console.log("khsdgfjksgfkljsgjkldf");
  //balanceOrion = await main(query2).data.me.wallets;
	console.log(balanceOrion);
	for(let objWallet of balanceOrion){
		indexOrionBalance[objWallet.currency.code] = objWallet;
	}
	
}