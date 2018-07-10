'use strict'

const crypto = require('crypto');
var request = require('request');
var fs = require('fs');
var arrOrionBuy;
var arrOrionSell;
var balanceSouth;
var calcBalance = 0;	
var indexBalance = {};
var arrSouthBuy;
var arrSouthSell;
var orders;
var secretSouth = 'tTiQAtoIJRAttGNbFBElwrCUmvdrwqBoPSjvucrYGJFJJkjPWU';
var objTrades = {};

fs.readFile("./data.txt", 'utf8', function(err, data) {
  var arr = data.split("\n");
  console.log(arr);
  for(let i of arr){
    if(i == ''){
      break;
    }
    let obj = JSON.parse(arr[i]);
    objTrades[obj.Code] = obj;
    
  }
  fnBalanceSouth();
  setInterval(fnBalanceSouth, 20000);
  
});








async function fnOrionx(){
	let query = {                        
		query: '{marketOrderBook(marketCode: "CHABTC", limit:20){buy{limitPrice amount accumulated} sell{limitPrice amount accumulated} spread}}'
	};

	var libroOrion = await main(query);
	
	//console.log(libroOrion);
  
	arrOrionBuy = libroOrion.data.marketOrderBook.buy;
	arrOrionSell = libroOrion.data.marketOrderBook.sell; 
	
	
	
	
	
	var date = new Date;			
	var nonce = date.getTime();  
	var req = {nonce: nonce, key: 'uUVmpIxtbxJWMrNOrOBkXXWKPXnJdh'}  
	var headers = fnHeader(req);

	var options = {
	url     : 'https://www.southxchange.com/api/listOrders',
	method  : 'POST',
	//jar     : true,
	headers : headers,
	json : true,
	body:	req//JSON.stringify(req)
	}

	request.post(options, fnListOrders)	
	
}

async function fnListOrders(err,httpResponse,body) {
  console.log(body);
  orders = body;
  for(let order of orders){
    if(!objTrades[order.Code]){
      order.liquidados = 0;
      order.ejecutados = order.OriginalAmount;
      objTrades[order.Code] = order;
      
    } else {
      objTrades[order.Code].Amount = order.Amount;
      order.ejecutados = order.OriginalAmount - order.Amount;
    }
    fs.appendFileSync('./data.txt', JSON.stringify(order) + "\n", (err) => {
      if (err) throw err;
      console.log('The "data to append" was appended to file!');
    });
  }
  var URL = 'https://www.southxchange.com/api/book/CHA/BTC';  
  var respJSON = '';		
  // Realiza la petición
  var http = require('https');
  //console.log(URL);
  var peticion = http.get(URL, function(respuesta) {		  
    var cancionesJSON = '';
    respuesta.on('data', function(respuestaJSON) {
    respJSON += respuestaJSON;
    });
    // Una vez finalizada la respuesta se procesa
    respuesta.on('end', async function() {				
      //console.log(respJSON);
      var data = JSON.parse(respJSON); 
      arrSouthBuy = data.BuyOrders;
      arrSouthSell = data.SellOrders;
      
      console.log(arrSouthSell[0]);
      console.log(arrSouthBuy[0]);

      for(let order of orders){
        if(order.Type == 'buy'){
          console.log(arrSouthBuy[0].Price + ' - ' + arrSouthBuy[1].Price)
          if(arrSouthBuy[0].Price > order.LimitPrice || arrSouthBuy[0].Price - arrSouthBuy[1].Price > 0.0000001 || arrOrionBuy[0].limitPrice / 100000000 - arrSouthBuy[1].Price < 0.000001){
            await fnCancelOrder(order);
            console.log('eliminada');
          }
          
        } else {
          console.log('EVALUANDO');
          
          console.log(arrSouthSell[0].Price + ' < ' +  order.LimitPrice);
          console.log((arrOrionBuy[0].limitPrice / 100000000) + ' > ' + arrSouthSell[0].Price);
          console.log(arrSouthSell[1].Price  + ' - ' + arrSouthSell[0].Price + ' > 0.0000001');
          console.log(arrSouthSell[0].Price  <  order.LimitPrice);
          console.log((arrOrionBuy[0].limitPrice / 100000000)  >  arrSouthSell[0].Price);
          console.log((arrSouthSell[1].Price  - arrSouthSell[0].Price)  > 0.0000001);
          console.log((arrSouthSell[1].Price  - arrSouthSell[0].Price));
          console.log('EVALUANDO');

          if(arrSouthSell[0].Price < order.LimitPrice || arrOrionBuy[0].limitPrice / 100000000 > arrSouthSell[0].Price || arrSouthSell[1].Price - arrSouthSell[0].Price > 0.0000001){
            await fnCancelOrder(order);
            console.log('eliminada');
          }
        }
      }
      
      
      console.log("Orion Buy: " + (arrOrionBuy[0].limitPrice / 100000000));
      console.log("Orion Sell: " + (arrOrionSell[0].limitPrice / 100000000));
      console.log("South Buy: " + arrSouthBuy[0].Price);
      console.log("South Sell: " + arrSouthSell[0].Price);
      
      if(!orders){
        console.log("Sin Orden");
        console.log(arrOrionBuy[0].limitPrice / 100000000 - arrSouthBuy[0].Price > 0.000001);
        console.log(1 - (arrSouthBuy[0].Price / (arrOrionBuy[0].limitPrice / 100000000)) > 0.1);
        if('1 - ' + arrOrionBuy[0].limitPrice / 100000000 - arrSouthBuy[0].Price > 0.000001 || 1 - (arrSouthBuy[0].Price / (arrOrionBuy[0].limitPrice / 100000000)) > 0.1){
          console.log("Creando Orden");
          var f = await fnCreateOrder('buy').then();
          console.log(f);
          console.log('orden creada');
        }
      } else {
        var sw = false;
        for(let order of orders){
          if(order.Type == 'buy'){
            sw = true;
            break;
          }
        }
        if(!sw){
          console.log(arrOrionBuy[0].limitPrice / 100000000 - arrSouthBuy[0].Price > 0.000001);
          console.log(1 - arrSouthBuy[0].Price / (arrOrionBuy[0].limitPrice / 100000000) > 0.1);
          console.log('1 - ' + arrSouthBuy[0].Price + ' / ' + (arrOrionBuy[0].limitPrice / 100000000) + ' > ' + 0.1);
          if(arrOrionBuy[0].limitPrice / 100000000 - arrSouthBuy[0].Price > 0.000001 || 1 - (arrSouthBuy[0].Price / (arrOrionBuy[0].limitPrice / 100000000)) > 0.1){
            console.log("Creando Orden");
            var f = await fnCreateOrder('buy').then();
            console.log(f);
            console.log('orden creada');
          }         
        }
      }
      console.log('EvalOrderMarket');
      await fnEvalOrderMarket();
      
      if(indexBalance['CHA'].Deposited > 500){
        if(indexBalance['CHA'].Available < indexBalance['CHA'].Deposited){
          for(let order of orders){
            if(order.Type == 'sell'){
              await fnCancelOrder(order);
            }
          }
        }         
        await fnEnviaMoneda();
      } else {
        if(indexBalance['CHA'].Available > 0){
          await fnCreateOrder('sell');
        }
      }

      
      
      
    });

  }).on('error', function(error) {
    // Ocurrió un error en el request
    console.log('Error encontrado al realizar la consulta: ' + error.message);
  });
  
  
}

function fnEnviaMoneda(){
  console.log('ENVIAR MONEDAS');
  var date = new Date;		
	var nonce = date.getTime();
	var req = {nonce: nonce, key: 'uUVmpIxtbxJWMrNOrOBkXXWKPXnJdh', currency: 'CHA', address: 'cZxnpT3boZySKMvdYQMizYTsx7ZDbfjoat', amount: (indexBalance['CHA'].Available - (0.01 * indexBalance['CHA'].Available))}	
	var headers = fnHeader(req);
	
	
	var options = {
		url     : 'https://www.southxchange.com/api/withdraw',
		method  : 'POST',
		//jar     : true,
		headers : headers,
		json : true,
		body:	req//JSON.stringify(req)
	}	
		
	request.post(options, function(err,httpResponse,body) {
		console.log(body);
		
		
	}).on('error', function(error) {
	  // Ocurrió un error en el request
	  console.log('Error encontrado al realizar la consulta: ' + error.message);
	});
}

function fnEvalOrderMarket(){
  var arrMercado = [];
  var i = 0;
  calcBalance = 0;
  for(let datSo of arrSouthSell){
    let datOr = arrOrionBuy[i];
    datOr.dat = 'holas';
    //console.log(datOr);  
    if((datSo.Price  * 100000000) + 100 < datOr.limitPrice){
      arrMercado.push(datSo);
      datSo.qty = datSo.Amount;
      if(datOr.amount - datSo.Amount * 100000000 >= 0){
        datOr.amount -= datSo.Amount * 100000000;
        datSo.qty = 0;
        calcBalance += datSo.Amount * datSo.Price;
       
        if(calcBalance >= indexBalance['BTC'].Available){
          arrMercado.pop();
          break;
        }
      } else {
        datSo.qty -= datOr.amount;
        i++;
      }
      
    } else {
      break;
    }
    
  }

  if(arrMercado.length > 0){
    var price = arrMercado[arrMercado.length - 1].Price;
    var qty = 0;
    for(let obj of arrMercado){
      qty += obj.Amount - obj.qty;
    }
    console.log(arrMercado);
    fnCreateOrderMarket(price, qty);
  }

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


async function fnCancelOrder(order){
	var date = new Date;		
	var nonce = date.getTime();
	var req = {nonce: nonce, key: 'uUVmpIxtbxJWMrNOrOBkXXWKPXnJdh', orderCode: order.Code}	
	var headers = fnHeader(req);
	
	var options = {
		url     : 'https://www.southxchange.com/api/cancelOrder ',
		method  : 'POST',
		//jar     : true,
		headers : headers,
		json : true,
		body:	req//JSON.stringify(req)
	}

	request.post(options, function(err,httpResponse,body) {
		console.log(body);
			
	});
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

async function fnCreateOrder(type){
  //return new Promise(resolve => {
    var date = new Date;		
    var nonce = date.getTime();
    var vol;
    var price;
    if(type == 'buy'){
      vol = indexBalance['BTC'].Available / 2;
      vol = vol / (arrSouthBuy[0].Price + 0.00000001);
      price = (arrSouthBuy[0].Price + 0.00000001);
    } else {
      vol = indexBalance['CHA'].Available;
      price = (arrSouthSell[0].Price);
    }
    
    var req = {nonce: nonce, key: 'uUVmpIxtbxJWMrNOrOBkXXWKPXnJdh', listingCurrency: 'CHA', referenceCurrency: 'BTC', type: type, amount: vol, limitPrice: price}	
    var headers = fnHeader(req);
    
    
    var options = {
      url     : 'https://www.southxchange.com/api/placeOrder',
      method  : 'POST',
      //jar     : true,
      headers : headers,
      json : true,
      body:	req//JSON.stringify(req)
    }	
      
    request.post(options, function(err,httpResponse,body) {
      console.log(body);
      if(body.split(" ").length == 1){
        console.log(body);
        
          
      }
    });
    return;
  //}); 
}

function fnCreateOrderMarket(price, qty){
	var date = new Date;		
	var nonce = date.getTime();
	console.log(price + ', ' + qty);
	var vol = indexBalance['BTC'].Available;
	
	
	var req = {nonce: nonce, key: 'uUVmpIxtbxJWMrNOrOBkXXWKPXnJdh', listingCurrency: 'CHA', referenceCurrency: 'BTC', type: 'buy', amount: qty, limitPrice: price}	
	var headers = fnHeader(req);
	
	
	var options = {
		url     : 'https://www.southxchange.com/api/placeOrder',
		method  : 'POST',
		//jar     : true,
		headers : headers,
		json : true,
		body:	req//JSON.stringify(req)
	}	
		
	request.post(options, function(err,httpResponse,body) {
		console.log(body);
		if(body.split(" ").length == 1){
			console.log(body);
			
				
		}
	}).on('error', function(error) {
	  // Ocurrió un error en el request
	  console.log('Error encontrado al realizar la consulta: ' + error.message);
	});
}

function fnBalanceSouth(){
  console.log("*** NUEVA OPERACION ***");
	var date = new Date;		
	var nonce = date.getTime();
	var req = {nonce: nonce, key: 'uUVmpIxtbxJWMrNOrOBkXXWKPXnJdh'}	
	var headers = fnHeader(req);
	
	
	var options = {
		url     : 'https://www.southxchange.com/api/listBalances',
		method  : 'POST',
		//jar     : true,
		headers : headers,
		json : true,
		body:	req//JSON.stringify(req)
	}	
		
	request.post(options, function(err,httpResponse,body) {
		//console.log(body);
		
		balanceSouth = body;
    console.log(balanceSouth);
    try{
      for(var i = 0; i < balanceSouth.length; i++){
        var obj = balanceSouth[i];
        
        indexBalance[obj.Currency] = obj;
      }
      console.log(indexBalance['BTC']);
      calcBalance = indexBalance['BTC'].Available;
      fnOrionx();
    } catch(err){
      console.log(err);
    }
		
	}).on('error', function(error) {
	  // Ocurrió un error en el request
	  console.log('Error encontrado al realizar la consulta: ' + error.message);
	});
	
	
}
