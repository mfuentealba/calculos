'use strict'

const crypto = require('crypto');
var request = require('request');
var fs = require('fs');
var arrOrionBuy;
var arrOrionSell;
var arrOrionBuyBTCCLP;
var arrOrionSellBTCCLP;
var arrOrionBuyCHACLP;
var arrOrionSellCHACLP;
var balanceSouth;
var calcBalance = 0;	
var indexBalance = {precios:[]};
var arrSouthBuy;
var arrSouthSell;
var orders;
var secretSouth = 'TdYfvxqQojtRffghfsUPBufSppLoGkoKwVRfXvcYKVRpSOXJiw';
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
var BTCRef = 0;

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
  
	fnBalanceSouth();
	setInterval(fnBalanceSouth, 20000);
  
});




function fnOrden(points) {
    points = points.sort(function(a, b){return a-b});
	points = points.reverse();
    
}



async function fnOrionx(){
	let query = {                        
		query: `query{CHACLP: marketOrderBook(marketCode: "CHACLP", limit:100){buy{limitPrice amount accumulated} sell{limitPrice amount accumulated} spread}, 
		CHABTC: marketOrderBook(marketCode: "CHABTC", limit:100){buy{limitPrice amount accumulated} sell{limitPrice amount accumulated} spread},
		BTCCLP: marketOrderBook(marketCode: "BTCCLP", limit:100){buy{limitPrice amount accumulated} sell{limitPrice amount accumulated} spread}
		}`
	};

  var libroOrion = await main(query);
  

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
  console.log("khsdgfjksgfkljsgjkldf");
  //balanceOrion = await main(query2).data.me.wallets;
	//console.log(balanceOrion);
	for(let objWallet of balanceOrion){
		indexOrionBalance[objWallet.currency.code] = objWallet;
	}
	
	
	let query3 = {                        
		query: `{
  history: marketTradeHistory(marketCode: "CHABTC") {
    _id
    amount
    price
    date
    __typename
  }
}`
  };
	
	tradesOrion = await main(query3);
	tradesOrion = tradesOrion.data;
	tradesOrion = tradesOrion.history;
	//console.log(tradesOrion);
	
	//for()
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
	
	
	
	
  
	arrOrionBuy = libroOrion.data.CHABTC.buy;
	arrOrionSell = libroOrion.data.CHABTC.sell;

	arrOrionBuyCHACLP = libroOrion.data.CHACLP.buy;
	arrOrionSellCHACLP = libroOrion.data.CHACLP.sell;	
	
	arrOrionBuyBTCCLP = libroOrion.data.BTCCLP.buy;
	arrOrionSellBTCCLP = libroOrion.data.BTCCLP.sell;	
	
	
	var acum = 0;
	for(var obj of arrOrionSellBTCCLP){
		acum += obj['amount'];
		console.log(obj);
		if(acum > 1000000){
			BTCRef = obj['limitPrice'];
			break;
		}
	}
	console.log("BTCREF: " + BTCRef);
	
	
	for(var obj of arrOrionBuyCHACLP){
		obj['limitPrice'] = obj['limitPrice'] / BTCRef * 100000000;
		
		
	}
	
	
	
	var volEstimado = indexOrionBalance['CHA'].availableBalance / 200000000;
	if(orderOrion.length == 0){
		/**********************REVISAR******************************/
		/*if(objLiq.precios.length > 0){
			for(var y = 0; y < objLiq.precios.length; y++){
				let ob = objLiq[objLiq.precios[y]];
				if(volEstimado - ob.qty > 0){
					volEstimado -= ob.qty;	
					ob.enOrden = ob.qty;
					ob.qty = 0;
				} else {
					ob.qty -= volEstimado;	
					ob.enOrden += volEstimado;
					volEstimado = 0;
					break;
				}
				
			}
			stopLoss = (objLiq.precios[y] + 50) * 100000000;
			
			console.log(objLiq.precios);
			console.log("stopLoss: " + stopLoss)
			console.log(['CHA'].availableBalance / 200000000)
			console.log(arrOrionSell[0])
			createOrderOrion((indexOrionBalance['CHA'].availableBalance - 20000000000) / 2, arrOrionSell[0].limitPrice);	
		}*/
		
	} else {/**********************REVISAR******************************/
		/*if(stopLoss < arrOrionBuy[0].limitPrice ){
			//Cancelar orden y remate
			
			var queryCancel = {                        
				query: 'mutation {					  cancelOrder(orderId:"' + orderOrion[0]._id + '") {						_id						__typename					  }}'
			}
			console.log(queryCancel);
			//var resp = await main(queryCancel);
			//remate
			var queryRemate = {
				query: 'mutation {  placeMarketOrder(marketCode: "CHABTC", amount: ' + (orderOrion[0].amount - orderOrion[0].filled) + ', sell: true) {    _id    __typename  }}'
			};
			console.log(queryRemate);
			//resp = await main(queryRemate);
			
		} else {
			if(filled != orderOrion[0].filled){
				var difFill = orderOrion[0].filled - filled;
				
				for(let y = 0; y < objLiq.precios.length; y++){
					let ob = objLiq[objLiq.precios[y]];
					console.log(ob);
					if(ob.enOrden - difFill > 0){
						ob.enOrden -= difFill;
						ob.liquidados += difFill;
						break;
					} else {
						difFill -= ob.enOrden;
						ob.liquidados += ob.enOrden;
						ob.enOrden = 0;
					}	
				}
				
				for(let z = 0; z < y - 1; z++){
					var ord = objLiq.precios.shift();
					fs.appendFileSync('./data.txt', JSON.stringify(ord) + "\n", (err) => {
						if (err) throw err;
						console.log('The "data to append" was appended to file!');
					  });
				}
				
			}
		}
		stopLoss = objLiq.precios[0] * 100000000 + 50;
		filled = orderOrion[0].filled;*/
	}
	
	
	
	
	var date = new Date;			
	var nonce = date.getTime();  
	var req = {nonce: nonce + 14400000, key: 'IUSfqcKQBmDwvrxbNBTGhXIjyltfAF'}  
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

async function createOrderOrion(qty, price){
	let mutation = {                        
		query: 'mutation {placeLimitOrder(marketCode: "CHABTC", amount:' + qty + ', limitPrice: ' + price + ', sell:true){_id __typename }}'
	  
	  };
	console.log("CREANDO ORDEN EN ORION DE PRECIO: " + price + "y volumen: " + qty);
  
	var r = await main(mutation);
	console.log("**** Respuesta orden orion*******")
	console.log(r)
	console.log("******************")
}


function fnEvaluaSituacion(){
  var price = 0;
  var priceLibro = 0;
  var vol = 0;
  var index = 0;
  var swEval;
  var debug = 0;
  for(let datoSo of arrSouthBuy){
    
    index++;
    if(datoSo.Amount > 10){
      vol = (indexBalance['BTC'] ? indexBalance['BTC'].Deposited : 0) / 8;
	  console.log("******************");
	  console.log(indexBalance['BTC']);
	  console.log(indexBalance);
	  console.log("******************");
	  price = (datoSo.Price + 0.00000001);
      vol = (vol / price) > 500 ? 500 : (vol / price);
	  if(indexBalance['CHA']){
		vol += indexBalance['CHA'].Deposited;  
	  }
	  
	  
      
      priceLibro = datoSo.Price;
      var ganancia = 0;
      var swDif = false;
      var dif = 0;
      var difPercent = 0;
      swEval = false;
      console.log("PRUEBA VALOR " + price);
      debug = 0;
      console.log("Volumen estimado: " + vol);
	  
	  console.log("COMPARANDO CON : " + (arrOrionBuyCHACLP[0].limitPrice));
	  
	  var arrEval;
	  console.log(arrOrionBuy[0].limitPrice + ' > ' + arrOrionBuyCHACLP[0].limitPrice)
	  if(arrOrionBuy[0].limitPrice > arrOrionBuyCHACLP[0].limitPrice){
		  arrEval = arrOrionBuy;
		  console.log("SELECCIONADO arrOrionBuy " + (arrOrionBuyCHACLP[0].limitPrice));
	  } else {
		  arrEval = arrOrionBuyCHACLP;
		  console.log("SELECCIONADO arrOrionBuyCHACLP " + (arrOrionBuyCHACLP[0].limitPrice));
	  }
	  
	  
      for(let dato of arrEval){
        debug++;
        dif = ((dato.limitPrice / 100000000) - price)// * dato.amount / 100000000;
        difPercent = 1 - (price / (dato.limitPrice / 100000000))// * dato.amount / 100000000;
        
        
        
        
        if(/*difPercent < 0.05 && */dif < 0.00000050){
          
          swDif = false;
          console.log("No sirve");
          
          break;
          
          
        } else if(vol - dato.amount / 100000000 < 0){
          if(swEval){
            swDif = true;
            dif = dif * vol;
            console.log((dif / vol) + ' <--------> ' + vol + ' price: ' + (dato.limitPrice / 100000000));
            ganancia += dif;
            break;
          } else {
            
            dif = dif * vol;
            console.log((dif / vol) + ' <--------> ' + vol + ' price: ' + (dato.limitPrice / 100000000));
            ganancia += dif;
            swEval = true;
            console.log('GANANCIA: ' + ganancia);
            vol = (indexBalance['BTC'] ? indexBalance['BTC'].Deposited : 0) / 8;
            vol = (vol / price) > 500 ? 500 : (vol / price);
			if(indexBalance['CHA']){
				vol += indexBalance['CHA'].Deposited;
			}
            dif = 0;
          }
          
        } else {
          
          vol -= dato.amount / 100000000;
          dif = dif * dato.amount / 100000000;
          
          
        }
        console.log((dif / (dato.amount / 100000000)) + ' <--------> ' + vol + ' price: ' + (dato.limitPrice / 100000000));
        ganancia += dif;
      } 
      if(swDif){
        break;
      }
    }
    
  }
  return {swDif: swDif, price: price, vol: vol, ganancia: ganancia, priceLibro: priceLibro, index: index};
}

function fnEvaluaTrade(price, vol){
  
  var priceLibro = 0;
  
  var index = 0;
  var swEval;
  var debug = 0;
  

  for(let dato of arrOrionBuy){
    
    dif = ((dato.limitPrice / 100000000) - price)// * dato.amount / 100000000;
    difPercent = 1 - (price / (dato.limitPrice / 100000000))// * dato.amount / 100000000;
    
    
    
    
    if(/*difPercent < 0.05 && */dif < 0.00000050){
      
      swDif = false;
      console.log("No sirve");
      return {estado: 'enviar'};
      
      
      
    } else if(vol - dato.amount / 100000000 < 0){
      
      swDif = true;
      dif = dif * vol;
      
      return {estado: 'no aun'};   
      
    } else {        
      vol -= dato.amount / 100000000;
      dif = dif * dato.amount / 100000000;
      
      
    }
    
  } 
 
    
  
  return {estado: 'no aun'};
}

async function fnListOrders(err,httpResponse,body) {
  console.log(body);
  orders = body;
  var buyOrder = false;
  for(let order of orders){
    if(!objTrades[order.Code]){
      order.liquidados = 0;
      order.ejecutados = order.OriginalAmount;
      objTrades[order.Code] = order;
      objLiq[order.LimitPrice] = {qty: order.Amount, enviado: false, enOrden: 0, liquidados: 0, estado: 'V'};
	  console.log("****************");
	  console.log(order);
	  console.log("****************");
	  
	  objLiq.precios.push(order.LimitPrice);
	  fnOrden(objLiq.precios);
    } else {
      objTrades[order.Code].Amount = order.Amount;
      order.ejecutados = order.OriginalAmount - order.Amount;
      objLiq[order.LimitPrice].qty = order.ejecutados;
      
    }
    if(order.OriginalAmount != order.Amount){
      fs.appendFileSync('./data.txt', JSON.stringify(order) + "\n", (err) => {
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
      });
    }
    
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
	  
	  
      var objResp = fnEvaluaSituacion();
      var swDif = objResp.swDif;
      var price = objResp.price;
      var vol = objResp.vol;
      var ganancia = objResp.ganancia;
      var priceLibro = objResp.priceLibro;
      var index = objResp.index;
	  console.log("Ganancia: " + ganancia);
	  console.log("FIN PRUEBA VALOR: " + swDif);

      for(let order of orders){
        if(order.Type == 'buy'){
          console.log(priceLibro + ' != ' + order.LimitPrice);
          console.log(index);
		  console.log(arrSouthBuy);
          console.log(order.LimitPrice + ' - ' + arrSouthBuy[index].Price);
          console.log(order.LimitPrice - arrSouthBuy[index].Price);
          if(/*arrSouthBuy[0].Price*/ priceLibro != order.LimitPrice || order.LimitPrice - arrSouthBuy[index].Price > 0.00000002/* || arrOrionBuy[0].limitPrice / 100000000 - arrSouthBuy[1].Price < 0.000001*/){
            await fnCancelOrder(order);
            console.log('eliminada');
          }
          
        } else {
          console.log('EVALUANDO');
          
          console.log(arrSouthSell[0].Price + ' < ' +  order.LimitPrice);
          console.log((arrOrionBuy[0].limitPrice / 100000000) + ' > ' + arrSouthSell[0].Price);
          console.log((arrOrionSell[0].limitPrice / 100000000) + " > " + order.LimitPrice);
          console.log(arrSouthSell[0].Price  <  order.LimitPrice);
          console.log((arrOrionBuy[0].limitPrice / 100000000)  >  arrSouthSell[0].Price);
          console.log((arrSouthSell[1].Price  - arrSouthSell[0].Price)  > 0.0000001);
          console.log(arrOrionSell[0].limitPrice / 100000000 > order.LimitPrice);
          console.log('EVALUANDO');

          if(arrSouthSell[0].Price < order.LimitPrice || ( arrOrionBuy[0].limitPrice / 100000000 > arrSouthSell[0].Price && arrOrionBuyCHACLP[0].limitPrice > arrSouthSell[0].Price ) || arrOrionSell[0].limitPrice / 100000000 > order.LimitPrice){
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
		
		
		
		
        if(swDif/* || 1 - (arrSouthBuy[0].Price / (arrOrionBuy[0].limitPrice / 100000000)) > 0.1*/){
          console.log("Creando Orden");
          vol = indexBalance['BTC'].Available / 8;          
		  vol = (vol / price) > 500 ? 500 : (vol / price);
          var f = await fnCreateOrder('buy', price, vol).then();
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
		  
		  
		  
          if(swDif/* || 1 - (arrSouthBuy[0].Price / (arrOrionBuy[0].limitPrice / 100000000)) > 0.1*/){
            console.log("Creando Orden");
            vol = (indexBalance['BTC'] ? indexBalance['BTC'].Available : 0) / 8;
            vol = (vol / price) > 500 ? 500 : (vol / price);
            var f = await fnCreateOrder('buy', price, vol).then();
            console.log(f);
            console.log('orden creada');
          }         
        }
      }
      console.log('EvalOrderMarket');
	  await fnEvalOrderMarket();
	  if(indexBalance['CHA']){
		//await fnEvalOrderMarket();
		if(indexBalance['CHA'].Deposited > 100){
			if(indexBalance['CHA'].Available < indexBalance['CHA'].Deposited){
			  for(let order of orders){
				  if(order.Type == 'sell'){
					await fnCancelOrder(order);
				  }
			  }
			}         
			await fnEnviaMoneda();
		  } else {
			 console.log("arrOrionBuy[0].limitPrice < arrSouthSell[0].Price");
			 console.log(arrOrionBuy[0].limitPrice / 100000000 + " < " + arrSouthSell[0].Price);
			if(indexBalance['CHA'].Available > 0 && arrOrionBuy[0].limitPrice / 100000000 < arrSouthSell[0].Price){
			  vol = indexBalance['CHA'].Available;
			  price = (arrSouthSell[0].Price);
			  await fnCreateOrder('sell', price, vol);
			}
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
	var req = {nonce: nonce + 14400000, key: 'IUSfqcKQBmDwvrxbNBTGhXIjyltfAF', currency: 'CHA', address: 'cZxnpT3boZySKMvdYQMizYTsx7ZDbfjoat', amount: (indexBalance['CHA'].Available - (0.01 * indexBalance['CHA'].Available))}	
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
  console.log("Comparando Libros");
  for(let datSo of arrSouthSell){
    let datOr = arrOrionBuy[i];
    datOr.dat = 'holas';
    //console.log(datOr);  
	  
	console.log(((datSo.Price  * 100000000) + 100) + ' < ' + datOr.limitPrice);
    if((datSo.Price  * 100000000) + 100 < datOr.limitPrice){
      arrMercado.push(datSo);
      datSo.qty = datSo.Amount;
      if(datOr.amount - datSo.Amount * 100000000 >= 0){
        datOr.amount -= datSo.Amount * 100000000;
        datSo.qty = 0;
        calcBalance += datSo.Amount * datSo.Price;
       
        if(calcBalance >= (indexBalance['BTC'] ? indexBalance['BTC'].Available : 0)){
          arrMercado.pop();
          break;
        }
      } else {
        datSo.qty -= datOr.amount / 100000000;
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
    console.log("CREANDO ORDEN A MERCADO");
    fs.appendFileSync('./data2.txt', 'CREANDO ORDEN A MERCADO' + price + ', ' + qty + "\n", (err) => {
      if (err) throw err;
        console.log('The "data to append" was appended to file!');
    });
    
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
   


async function fnCancelOrder(order){
	var date = new Date;		
	var nonce = date.getTime();
	var req = {nonce: nonce + 14400000, key: 'IUSfqcKQBmDwvrxbNBTGhXIjyltfAF', orderCode: order.Code}	
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

async function fnCreateOrder(type, price, vol){
  //return new Promise(resolve => {
    var date = new Date;		
    var nonce = date.getTime();
    
    
    var req = {nonce: nonce + 14400000, key: 'IUSfqcKQBmDwvrxbNBTGhXIjyltfAF', listingCurrency: 'CHA', referenceCurrency: 'BTC', type: type, amount: vol, limitPrice: price}	
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

async function fnCreateOrderMarket(price, qty){
	if(qty > indexOrionBalance['CHA'].availableBalance / 100000000){
		qty = indexOrionBalance['CHA'].availableBalance / 100000000;
	}
	var date = new Date;		
	var nonce = date.getTime();
	console.log(price + ', ' + qty);
	var vol = indexBalance['BTC'].Available;
	
	
	var req = {nonce: nonce + 14400000, key: 'IUSfqcKQBmDwvrxbNBTGhXIjyltfAF', listingCurrency: 'CHA', referenceCurrency: 'BTC', type: 'buy', amount: qty, limitPrice: price}	
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
	
	var queryRemate = {
				query: 'mutation {  placeMarketOrder(marketCode: "CHABTC", amount: ' + (qty * 100000000) + ', sell: true) {    _id    __typename  }}'
			};
	
  var r = await main(queryRemate);
  
  fs.appendFileSync('./data2.txt', JSON.stringify(queryRemate) + "\n", (err) => {
    if (err) throw err;
      console.log('The "data to append" was appended to file!');
  });


  fs.appendFileSync('./data2.txt', JSON.stringify(r) + "\n", (err) => {
    if (err) throw err;
      console.log('The "data to append" was appended to file!');
  });
}

function fnBalanceSouth(){
  console.log("*** NUEVA OPERACION ***");
	var date = new Date;		
	var nonce = date.getTime();
	var req = {nonce: nonce + 14400000, key: 'IUSfqcKQBmDwvrxbNBTGhXIjyltfAF'}	
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
      calcBalance = indexBalance['BTC'] ? indexBalance['BTC'].Available : 0;
      fnOrionx();
    } catch(err){
      console.log(err);
    }
		
	}).on('error', function(error) {
	  // Ocurrió un error en el request
	  console.log('Error encontrado al realizar la consulta: ' + error.message);
	});
	
	
}

async function fnOrionxBalance(){
	let query = {                        
		query: 'query consulta{CHABTC:marketOrderBook(marketCode: "CHABTC", limit:20){buy{limitPrice amount accumulated} sell{limitPrice amount accumulated} spread}, CHACLP:marketOrderBook(marketCode: "CHACLP", limit:20){buy{limitPrice amount accumulated} sell{limitPrice amount accumulated} spread}, BTCCLP:marketOrderBook(marketCode: "BTCCLP", limit:20){buy{limitPrice amount accumulated} sell{limitPrice amount accumulated} spread}}'
	};

	var libroOrion = await main(query);
	
	//console.log(libroOrion);
  
	arrOrionBuy = libroOrion.data.CHABTC.buy;
	arrOrionSell = libroOrion.data.CHABTC.sell; 
	
	arrOrionBuyCHACLP = libroOrion.data.CHACLP.buy;
	arrOrionSellCHACLP = libroOrion.data.CHACLP.sell; 
	
	arrOrionBuyBTCCLP = libroOrion.data.BTCCLP.buy;
	arrOrionSellBTCCLP = libroOrion.data.BTCCLP.sell; 
	
	var acum = 0;
	for(var obj of arrOrionSellBTCCLP){
		acum += obj['amount'];
		console.log(obj);
		if(acum > 1000000){
			BTCRef = obj['limitPrice'];
			break;
		}
	}
	console.log("BTCREF: " + BTCRef);
	
	
	
	var date = new Date;			
	var nonce = date.getTime();  
	var req = {nonce: nonce + 14400000, key: 'IUSfqcKQBmDwvrxbNBTGhXIjyltfAF'}  
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