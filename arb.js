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
var arrOrionBuyCHABTCCHABTC;
var arrSouthSellCHABTC;
var orders;
var secretSouth = 'tTiQAtoIJRAttGNbFBElwrCUmvdrwqBoPSjvucrYGJFJJkjPWU';
var objTrades = {};
var objTradesOrion = {};
var balanceOrion;
var indexOrionBalance = {};
var orderOrion;
var tradesOrion;
var moment = require('moment');
console.log(moment());
var objLiq = {precios:[]};
var objLiqOrion = {precios:[]};
var stopLoss = 0;
var filled = 0;
var mejorPrecio;
var arrRemate;
var btcRef = 0;

fs.readFile("soutOrder.txt", 'utf8', function(err, data) {
	try{
		var arr = data.split("\n");
		console.log(arr);
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
  
	fs.readFile("orionOrder.txt", 'utf8', function(err, data) {
		try{
			var arr = data.split("\n");
			console.log(arr);
			for(let i of arr){
				console.log(i);
				if(i == ''){
				  break;
				}
				let obj = JSON.parse(i);
				objTrades[obj._id] = obj;

			}	
		} catch(err){
			console.log(err);
		}
	  
		fnProceso();
		setInterval(fnProceso, 20000);
	  
	});
  
  
	
  
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
		
		arrOrionBuyCHABTCCHABTC = data.BuyOrders;
		arrSouthSellCHABTC = data.SellOrders;

		console.log(arrSouthSellCHABTC[0]);  
		console.log(arrOrionBuyCHABTCCHABTC[0]);
		

		
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
	*/
	await fnOrionxBalance();
	
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
	
	
	for(let i = 0; i < arrOrionSellBTCCLP.length; i++){
		let obj = arrOrionSellBTCCLP[i];
		if(obj.accumulated / 100000000 > 0.005){
			btcRef = obj.limitPrice;	
			break;
		}		
	}
	
	console.log("btcRef: " + btcRef);
	for(let i = 0; i < arrOrionBuyCHABTC.length; i++){
		let obj = arrOrionBuyCHABTC[i];
		obj = {px: (obj.limitPrice / 100000000) , qty: obj.amount / 100000000, acum: obj.accumulated / 100000000};
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
		
		obj = {px: (obj.limitPrice / btcRef).toFixed(8), qty: obj.amount / 100000000, acum: obj.accumulated / 100000000, pxRef: obj.limitPrice};
		arrOrionBuyCHACLP[i] = obj;
		//console.log(obj);
	}
	console.log(arrOrionBuyCHACLP[0]);
	
	
	for(let i = 0; i < arrOrionSellCHACLP.length; i++){
		let obj = arrOrionSellCHACLP[i];
		obj = {px: (obj.limitPrice / btcRef).toFixed(8), qty: obj.amount / 100000000, acum: obj.accumulated / 100000000, pxRef: obj.limitPrice};
		arrOrionSellCHACLP[i] = obj;
	}
	var acum = 0;
	for(let i = 0; i < arrOrionBuyCHABTCCHABTC.length; i++){
		let obj = arrOrionBuyCHABTCCHABTC[i];
		acum += obj.Amount;
		obj = {px: obj.Price, qty: obj.Amount, acum: acum};
		arrOrionBuyCHABTCCHABTC[i] = obj;
		//console.log(obj);
	}
	console.log(arrOrionBuyCHABTCCHABTC[0]);
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

var arrPreciosComp = [arrOrionBuyCHACLP[0].px, arrOrionBuyCHABTC[0].px, arrOrionBuyCHABTCCHABTC[0].px];

arrPreciosComp = arrPreciosComp.sort(function(a, b){return b-a});
	if(arrOrionBuyCHACLP[0].px == arrPreciosComp[2]){
		console.log("MEJOR ORION CHACLP " + arrOrionBuyCHACLP[0].px);
		mejorPrecio = arrOrionBuyCHACLP;
	} else if(arrOrionBuyCHABTC[0].px == arrPreciosComp[2]){
		console.log("MEJOR ORION CHABTC " + arrOrionBuyCHABTC[0].px);
		mejorPrecio = arrOrionBuyCHABTC;
	} else {
		console.log("MEJOR SOUTH CHABTC " + arrOrionBuyCHABTCCHABTC[0].px);
		mejorPrecio = arrOrionBuyCHABTCCHABTC;
	}
	
	console.log("****FIN MEJOR PRECIO***");
	
	/******FIN MEJOR PRECIO******/

	/******PRECIO REMATE******/
	console.log("****PRECIO REMATE***");
	
	if(arrOrionBuyCHACLP[0].px == arrPreciosComp[0]){
		console.log("MEJOR ORION CHACLP " + arrOrionBuyCHACLP[0].px);
		arrRemate = arrOrionBuyCHACLP;
	} else if(arrOrionBuyCHABTC[0].px == arrPreciosComp[0]){
		console.log("MEJOR ORION CHABTC " + arrOrionBuyCHABTC[0].px);
		arrRemate = arrOrionBuyCHABTC;
	} else {
		console.log("MEJOR SOUTH CHABTC " + arrOrionBuyCHABTCCHABTC[0].px);
		arrRemate = arrOrionBuyCHABTCCHABTC;
	}
	
	console.log("****FIN PRECIO REMATE***");
	
	/******FIN PRECIO REMATE******/

	/******INICIO DE CALCULOS******/
	console.log("\n\n\n****CALCULOS***");

	//fnRemateDirectoOrion();
	
	fnOrionCHABTC_CHACLP()

	
	
	/*fnEvaluacion(arrOrionBuyCHABTCCHABTC, arrOrionBuyCHABTC);
	fnEvaluacion(arrOrionBuyCHABTCCHABTC, arrOrionBuyCHACLP);
	fnEvaluacion(arrOrionBuyCHABTC, arrOrionBuyCHABTC);*/
	
	console.log("****FIN CALCULOS***");
	
	/******FIN CALCULOS******/
	
	
}

async function fnOrionCHABTC_CHACLP(){
	var price = 0;
	var priceLibro = 0;
	var vol = 0;
	var index = 0;
	var swEval;
	var debug = 0;
	for(let datoSo of arrOrionBuyCHABTC){

		index++;
		if(datoSo.qty > 10){
			vol = 0.002;//indexOrionBalance['BTC'].Deposited / 8;
			price = (datoSo.px + 0.00000001);
			vol = (vol / price);
			vol += (indexOrionBalance['CHA'].availableBalance / 100000000) - 200;//SON LAS QUE TENGO YA COMPRADAS menos las 200 para remate rapido
			
			priceLibro = datoSo.px;
			var ganancia = 0;
			var swDif = false;
			var dif = 0;
			var difPercent = 0;
			swEval = false;
			console.log("PRUEBA VALOR " + price);
			debug = 0;
			console.log("Volumen estimado: " + vol);
			for(let dato of arrOrionBuyCHACLP){
				debug++;
				dif = (dato.px - price)// * dato.amount / 100000000;
				difPercent = 1 - (price / dato.px)// * dato.amount / 100000000;




				if(/*difPercent < 0.05 && */dif < 0.00000050){

					swDif = false;
					console.log("No sirve");

					break;


				} else if(vol - dato.qty < 0){
					if(swEval){
						swDif = true;
						dif = dif * vol;
						console.log((dif / vol) + ' <--------> ' + vol + ' price: ' + (dato.px));
						ganancia += dif;
						break;
					} else {

						dif = dif * vol;
						console.log((dif / vol) + ' <--------> ' + vol + ' price: ' + (dato.px));
						ganancia += dif;
						swEval = true;
						console.log('GANANCIA: ' + ganancia);
						vol = 0.002;//indexOrionBalance['BTC'].Deposited / 8;
						vol = (vol / price);
						vol += indexOrionBalance['CHA'].availableBalance / 100000000 - 200;
						dif = 0;
					}

				} else {

				vol -= dato.qty;
				dif = dif * dato.qty;


				}
				console.log((dif / (dato.qty)) + ' <--------> ' + vol + ' price: ' + (dato.px));
				ganancia += dif;
			} 
			if(swDif){
			break;
			}
		}

	}
	console.log({swDif: swDif, price: price, vol: vol, ganancia: ganancia, priceLibro: priceLibro, index: index});
	
	 var objResp = {swDif: swDif, price: price, vol: vol, ganancia: ganancia, priceLibro: priceLibro, index: index};
      var swDif = objResp.swDif;
      var price = objResp.price;
      var vol = objResp.vol;
      var ganancia = objResp.ganancia;
      var priceLibro = objResp.priceLibro;
      var index = objResp.index;
	  console.log("Ganancia: " + ganancia);
	  console.log("FIN PRUEBA VALOR: " + swDif);

      for(let order of orderOrion){
        if(order.sell == false){
          console.log(priceLibro + ' != ' + (order.limitPrice / 100000000));
          console.log(index);
          console.log((order.limitPrice / 100000000) + ' - ' + arrOrionBuyCHABTC[index].px);
          console.log((order.limitPrice / 100000000) - arrOrionBuyCHABTC[index].px);
          if(priceLibro != (order.limitPrice / 100000000) || (order.limitPrice / 100000000) - arrOrionBuyCHABTC[index].px > 0.00000002){
            await fnCancelOrderOrion(order);
            console.log('eliminada');
          }
          
        } else {
          console.log('EVALUANDO');
          
          console.log(arrOrionSellCHABTC[0].px + ' < ' +  (order.limitPrice / 100000000));
          console.log(arrOrionBuyCHACLP[0].px + ' > ' + arrOrionSellCHABTC[0].px);
          console.log(arrOrionSellCHACLP[0].px + " > " + (order.limitPrice / 100000000));
		  
          console.log(arrOrionSellCHABTC[0].px  <  (order.limitPrice / 100000000));		  
          console.log(arrOrionBuyCHACLP[0].px >  arrOrionSellCHABTC[0].px);
          console.log((arrOrionSellCHABTC[1].px  - arrOrionSellCHABTC[0].px)  > 0.0000001);
          console.log(arrOrionSellCHACLP[0].px > (order.limitPrice / 100000000));
          console.log('EVALUANDO');

          if(arrOrionSellCHABTC[0].px < (order.limitPrice / 100000000)  || 
						arrOrionBuyCHACLP[0].px > arrOrionSellCHABTC[0].px     || 
						arrOrionSellCHACLP[0].px > (order.limitPrice / 100000000)){
				
            await fnCancelOrderOrion(order);
            console.log('eliminada');
          }
        }
      }
      
      
      console.log("Orion CHACLP Buy: " + arrOrionBuyCHACLP[0].px);
      console.log("Orion CHACLP Sell: " + arrOrionSellCHACLP[0].px);
      console.log("Orion CHABTC Buy: " + arrOrionBuyCHABTC[0].px);
      console.log("Orion CHABTC Sell: " + arrOrionSellCHABTC[0].px);
      
			console.log("indexOrionBalance BTC: " + indexOrionBalance['BTC'].availableBalance);
			console.log(indexOrionBalance['BTC']);
	  
      if(!orderOrion){
        console.log("Sin Orden");
        console.log(arrOrionBuyCHACLP[0].px - arrOrionBuyCHABTC[0].px > 0.000001);
        console.log(1 - (arrOrionBuyCHABTC[0].px / arrOrionBuyCHACLP[0].px) > 0.1);
		
		
		
		
        if(swDif){
          console.log("Creando Orden");
          vol = indexOrionBalance['BTC'].availableBalance / 800000000;
          vol = (vol / price);
          var f = await fnCreateOrderOrion('buy', price, vol).then();
          console.log(f);
          console.log('orden creada');
        }
      } else {
        var sw = false;
		
		
        for(let order of orderOrion){
          if(order.sell == false){
            sw = true;
            break;
          }
        }
		
		console.log("\n\n**************");
		console.log(orderOrion);
		console.log("sw: " + sw);
		console.log("**************\n\n");
		
        if(!sw){
          console.log(arrOrionBuyCHACLP[0].px - arrOrionBuyCHABTC[0].Price > 0.000001);
          console.log(1 - arrOrionBuyCHABTC[0].px / arrOrionBuyCHACLP[0].px > 0.1);
          console.log('1 - ' + arrOrionBuyCHABTC[0].px + ' / ' + arrOrionBuyCHACLP[0].px + ' > ' + 0.1);
		  
		  
		  
          if(swDif){
            console.log("Creando Orden");
            vol = indexOrionBalance['BTC'].availableBalance / 800000000;
            vol = (vol / price);
            var f = await fnCreateOrderOrion('buy', price, vol).then();
            console.log(f);
            console.log('orden creada');
          }         
        }
      }
      
	  
	  
}



async function fnCancelOrderOrion(order){
	
	
	let mutation = {                        
		query: 'mutation {  cancelOrder(orderId: "' + order._id + '") {    _id    __typename  }}'
	};
	
	
	var r = await main(mutation);
	console.log(r);
}


async function fnCreateOrderOrion(tipo, price, qty){
	let mutation = {                        
		query: 'mutation {placeLimitOrder(marketCode: "CHABTC", amount:' + (qty * 100000000) + ', limitPrice: ' + (price * 100000000) + ', sell:' + (tipo == 'buy' ? false : true) + '){_id __typename }}'
	  
	  };
	console.log("CREANDO ORDEN EN ORION DE PRECIO: " + price + "y volumen: " + qty);
  
	var r = await main(mutation);
	console.log(r);
	fs.appendFileSync('./data3.txt', JSON.stringify(mutation) + "\n", (err) => {
	if (err) throw err;
		console.log('The "data to append" was appended to file!');
	});
}


function fnRemateDirectoOrion(){
	var arrMercado = [];
  var i = 0;
  calcBalance = 0;
  console.log("Comparando Libros");
  for(let datSo of arrOrionSellCHABTC){
    var datOr = arrOrionBuyCHACLP[i];
    datOr.dat = 'holas';
    //console.log(datOr);  
	  
	console.log((datSo.px + 0.00000100) + ' < ' + datOr.px);
    if(datSo.px + 0.00000100 < datOr.px){
      arrMercado.push(datSo);
      datSo.qty2 = datSo.qty;
      if(datOr.qty - datSo.qty >= 0){
        datOr.qty -= datSo.qty;
        datSo.qty2 = 0;
        calcBalance += datSo.qty * datSo.px;
       //console.log(indexOrionBalance);
        if(calcBalance >= indexOrionBalance['BTC'].availableBalance){
          arrMercado.pop();
          break;
        }
      } else {
        datSo.qty2 -= datOr.qty;
        i++;
      }
      
    } else {
      break;
    }
    
  }
	console.log("PRECIO arrOrionBuyCHACLP: " + datOr.px);
  if(arrMercado.length > 0){
    var price = datOr.pxRef;
    var qty = 0;
    for(let obj of arrMercado){
      qty += obj.qty - obj.qty2;
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


function fnCreateOrderMarket(price, qty){
	if(qty > indexOrionBalance['CHA'].availableBalance){
		qty = indexOrionBalance['CHA'].availableBalance;
	}
	
	
	var queryRemate = {
				query: 'mutation {  placeMarketOrder(marketCode: "CHABTC", amount: ' + qty + ', sell: false) {    _id    __typename  }}'
			};
			
	fs.appendFileSync('./data3.txt', JSON.stringify(queryRemate) + "\n", (err) => {
		if (err) throw err;
			console.log('The "data to append" was appended to file!');
	});
	
	//await main(queryRemate);
	qty = qty * 0.9961;
	var queryRemate2 = {
				query: 'mutation {  placeMarketOrder(marketCode: "CHACLP", amount: ' + qty + ', sell: true) {    _id    __typename  }}'
			};
			
	fs.appendFileSync('./data3.txt', JSON.stringify(queryRemate2) + "\n", (err) => {
		if (err) throw err;
			console.log('The "data to append" was appended to file!');
	});		
			
	
	//await main(queryRemate);
	
	qty = (price * qty / btcRef) * 1.0039;
	
	var queryRemate3 = {
				query: 'mutation {  placeMarketOrder(marketCode: "BTCCLP", amount: ' + qty + ', sell: false) {    _id    __typename  }}'
			};
			
	fs.appendFileSync('./data3.txt', JSON.stringify(queryRemate3) + "\n", (err) => {
		if (err) throw err;
			console.log('The "data to append" was appended to file!');
	});		
	
	//await main(queryRemate);
}





async function fnEvaluacion(arrCompra, arrVenta){

}


async function fnOrdenesSouth(){
	try{
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
	} catch(e){
		console.log("*************ERROR EN SERVICIO DE ORDENES SOUTH\n\n");
		console.log(e);
		console.log("*************ERROR EN SERVICIO DE ORDENES SOUTH\n\n");
	}
	
}


function fnOrden(points) {
    points = points.sort(function(a, b){return a-b});
	points = points.reverse();
    
}


async function fnListOrders(body) {
	//body = JSON.parse(body);
  //console.log(body);
  orders = body;
  var buyOrder = false;
  for(let order of orders){
    if(!objTrades[order.Code]){
      order.liquidados = 0;
      order.ejecutados = order.OriginalAmount;
      objTrades[order.Code] = order;
      objLiq[order.Price] = {qty: order.Amount, enviado: false, enOrden: 0, liquidados: 0, estado: 'V'};
	  objLiq.precios.push(order.Price);
	  fnOrden(objLiq.precios);
    } else {
      objTrades[order.Code].Amount = order.Amount;
      order.ejecutados = order.OriginalAmount - order.Amount;
      objLiq[order.Price].qty = order.ejecutados;
      
    }
    if(order.OriginalAmount != order.Amount){
      fs.appendFileSync('./southOrder.txt', JSON.stringify(order) + "\n", (err) => {
        if (err) throw err;
        console.log('The "data to append" was appended to file!');
      });
    }
    
  }
  
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
	
	var buyOrder = false;
	for(let order of orderOrion){
		if(!objTradesOrion[order._id]){
			order.liquidados = 0;
			order.ejecutados = 0;
			objTradesOrion[order._id] = order;
			objLiqOrion[order.limitPrice] = {qty: order.amount, enviado: false, enOrden: 0, liquidados: 0, estado: 'V'};
			objLiqOrion.precios.push(order.limitPrice);
			fnOrden(objLiqOrion.precios);
		} else {
			objTradesOrion[order._id].amount = order.amount;
			//order.ejecutados = order.filled;
			objLiqOrion[order.limitPrice].qty = order.ejecutados;

		}
		console.log(JSON.stringify(order));
		if(order.filled > 0 && order.filled != objTradesOrion[order._id].ejecutados){
			var qty = order.filled - objTradesOrion[order._id].ejecutados;
			objTradesOrion[order._id].ejecutados = order.filled;

			qty = qty * 0.9961;
			var queryRemate2 = {
						query: 'mutation {  placeMarketOrder(marketCode: "CHACLP", amount: ' + qty + ', sell: true) {    _id    __typename  }}'
					};
					
			fs.appendFileSync('./remate.txt', JSON.stringify(queryRemate2) + "\n", (err) => {
				if (err) throw err;
					console.log('The "data to append" was appended to file!');
			});		
					
			
			//await main(queryRemate);
			
			qty = (price * qty / btcRef) * 1.0039;
			
			var queryRemate3 = {
						query: 'mutation {  placeMarketOrder(marketCode: "BTCCLP", amount: ' + qty + ', sell: false) {    _id    __typename  }}'
					};
					
			fs.appendFileSync('./remate.txt', JSON.stringify(queryRemate3) + "\n", (err) => {
				if (err) throw err;
					console.log('The "data to append" was appended to file!');
			});


			fs.appendFileSync('./orionOrder.txt', JSON.stringify(order) + "\n", (err) => {
				if (err) throw err;
				console.log('The "data to append" was appended to file!');
			});
		}

	}
  
	
	
  
	
	
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
	
	//console.log(data.data.historyCHABTC);
	
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
	
	//console.log(libroOrion);
	
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
	
  //balanceOrion = await main(query2).data.me.wallets;
	//console.log(balanceOrion);
	for(let objWallet of balanceOrion){
		indexOrionBalance[objWallet.currency.code] = objWallet;
	}
	//console.log(indexOrionBalance);
}