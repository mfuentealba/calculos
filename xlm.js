'use strict'
const JSSHA = require('jssha');
const fetch = require('node-fetch');

const crypto = require('crypto');
var request = require('request-promise');
var fs = require('fs');
var Orden = require('./models/orden');
var ordenes = new Orden();

var arrOrionBuyXLMBTC;
var arrOrionSellXLMBTC;
var arrOrionBuyBTCCLP;
var arrOrionSellBTCCLP;
var arrOrionBuyXLMCLP;
var arrOrionSellXLMCLP;
var tradesOrionXLMBTC;
var tradesOrionXLMCLP;



var balanceSouth;
var calcBalance = 0;	
var indexBalance = {precios:[]};
var arrOrionBuyXLMBTCXLMBTC;
var arrSouthSellXLMBTC;
var orders;
var secretSouth = 'TdYfvxqQojtRffghfsUPBufSppLoGkoKwVRfXvcYKVRpSOXJiw';
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
var mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/arb', {useMongoClient: true}).then(
  () => {
    console.log('Conectado a Mongo!!!!')
    
  },
  err => {
	console.log("Error en conexión a mongoDB:\n"+err);	
   }
)

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


async function fnProceso(){
	console.log("*** NUEVA OPERACION ***");
  
	/******BALANCES******/
	console.log("******BALANCES******");
	var date = new Date;		
	var nonce = date.getTime();
	var req = {nonce: nonce + 14400000, key: 'IUSfqcKQBmDwvrxbNBTGhXIjyltfAF'}	
	var headers = fnHeader(req);
	
	
	await fnOrionxBalance();
	
	console.log("******FIN BALANCES******");
	
	/******FIN BALANCES******/
	
	
	/******LIBROS******/
	console.log("****LIBROS***");
	await fnLibrosOrion();
	//await fnLibroSouth();
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
	//await fnOrdenesSouth();
	
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
	for(let i = 0; i < arrOrionBuyXLMBTC.length; i++){
		let obj = arrOrionBuyXLMBTC[i];
		obj = {px: (obj.limitPrice / 100000000) , qty: obj.amount / 10000000, acum: obj.accumulated / 10000000};
		arrOrionBuyXLMBTC[i] = obj;
		//console.log(obj);
	}
	console.log(arrOrionBuyXLMBTC[0]);
	for(let i = 0; i < arrOrionSellXLMBTC.length; i++){
		let obj = arrOrionSellXLMBTC[i];
		obj = {px: obj.limitPrice / 100000000, qty: obj.amount / 10000000, acum: obj.accumulated / 10000000};
		arrOrionSellXLMBTC[i] = obj;
	}
	
	
	for(let i = 0; i < arrOrionBuyXLMCLP.length; i++){
		let obj = arrOrionBuyXLMCLP[i];
		
		obj = {px: (obj.limitPrice / btcRef).toFixed(8), qty: obj.amount / 10000000, acum: obj.accumulated / 10000000, pxRef: obj.limitPrice};
		arrOrionBuyXLMCLP[i] = obj;
		//console.log(obj);
	}
	console.log(arrOrionBuyXLMCLP[0]);
	
	
	for(let i = 0; i < arrOrionSellXLMCLP.length; i++){
		let obj = arrOrionSellXLMCLP[i];
		obj = {px: (obj.limitPrice / btcRef).toFixed(8), qty: obj.amount / 10000000, acum: obj.accumulated / 10000000, pxRef: obj.limitPrice};
		arrOrionSellXLMCLP[i] = obj;
	}
	var acum = 0;
	/*for(let i = 0; i < arrSouthBuyXLMBTC.length; i++){
		let obj = arrSouthBuyXLMBTC[i];
		acum += obj.Amount;
		obj = {px: obj.Price, qty: obj.Amount, acum: acum};
		arrOrionBuyXLMBTCXLMBTC[i] = obj;
		//console.log(obj);
	}
	console.log(arrSouthBuyXLMBTC[0]);
	acum = 0;
	
	for(let i = 0; i < arrSouthSellXLMBTC.length; i++){
		let obj = arrSouthSellXLMBTC[i];
		acum += obj.Amount;
		
		obj = {px: obj.Price, qty: obj.Amount, acum: acum};
		arrSouthSellXLMBTC[i] = obj;
	}*/
	
	console.log("****FIN IGUALANDO LIBROS***");
	
	/******FIN IGUALANDO LIBROS******/
	

	
	/******MEJOR PRECIO******/
	console.log("****MEJOR PRECIO***");

var arrPreciosComp = [arrOrionBuyXLMCLP[0].px, arrOrionBuyXLMBTC[0].px/*, arrSouthBuyXLMBTC[0].px*/];

arrPreciosComp = arrPreciosComp.sort(function(a, b){return b-a});
	console.log("Comparando Precios: " + arrOrionBuyXLMCLP[0].px + ' ' + arrPreciosComp[arrPreciosComp.length - 1]);
	console.log("Comparando Precios: " + arrOrionBuyXLMBTC[0].px + ' ' + arrPreciosComp[arrPreciosComp.length - 1]);
	if(arrOrionBuyXLMCLP[0].px == arrPreciosComp[2]){
		console.log("MEJOR ORION XLMCLP " + arrOrionBuyXLMCLP[0].px);
		mejorPrecio = arrOrionBuyXLMCLP;
	} else if(arrOrionBuyXLMBTC[0].px == arrPreciosComp[2]){
		console.log("MEJOR ORION XLMBTC " + arrOrionBuyXLMBTC[0].px);
		mejorPrecio = arrOrionBuyXLMBTC;
	}/* else {
		console.log("MEJOR SOUTH XLMBTC " + arrSouthBuyXLMBTC[0].px);
		mejorPrecio = arrSouthBuyXLMBTC;
	}*/
	
	console.log("****FIN MEJOR PRECIO***");
	
	/******FIN MEJOR PRECIO******/

	/******PRECIO REMATE******/
	console.log("****PRECIO REMATE***");
	
	if(arrOrionBuyXLMCLP[0].px == arrPreciosComp[0]){
		console.log("MEJOR ORION XLMCLP " + arrOrionBuyXLMCLP[0].px);
		arrRemate = arrOrionBuyXLMCLP;
	} else if(arrOrionBuyXLMBTC[0].px == arrPreciosComp[0]){
		console.log("MEJOR ORION XLMBTC " + arrOrionBuyXLMBTC[0].px);
		arrRemate = arrOrionBuyXLMBTC;
	} /*else {
		console.log("MEJOR SOUTH XLMBTC " + arrSouthBuyXLMBTC[0].px);
		arrRemate = arrSouthBuyXLMBTC;
	}*/
	
	console.log("****FIN PRECIO REMATE***");
	
	/******FIN PRECIO REMATE******/

	/******INICIO DE CALCULOS******/
	console.log("\n\n\n****CALCULOS***");

	//fnRemateDirectoOrion();
	
	fnOrionXLMBTC_XLMCLP()

	
	
	/*fnEvaluacion(arrOrionBuyXLMBTCXLMBTC, arrOrionBuyXLMBTC);
	fnEvaluacion(arrOrionBuyXLMBTCXLMBTC, arrOrionBuyXLMCLP);
	fnEvaluacion(arrOrionBuyXLMBTC, arrOrionBuyXLMBTC);*/
	
	console.log("****FIN CALCULOS***");
	
	/******FIN CALCULOS******/
	
	
}

async function fnOrionXLMBTC_XLMCLP(){
	var price = 0;
	var priceLibro = 0;
	var vol = 0;
	var index = 0;
	var swEval;
	var debug = 0;
	for(let datoSo of arrOrionBuyXLMBTC){

		index++;
		if(datoSo.qty > 10){
			vol = indexOrionBalance['BTC'].availableBalance / 800000000;
			price = (datoSo.px * 100000000 + 1) / 100000000;
			vol = (vol / price);
			vol += (indexOrionBalance['XLM'].availableBalance / 10000000)/* - 200*/;//SON LAS QUE TENGO YA COMPRADAS menos las 200 para remate rapido
			console.log(vol);
			vol = vol > 500 ? 500 : vol;
			console.log(vol);
			priceLibro = datoSo.px;
			var ganancia = 0;
			var swDif = false;
			var dif = 0;
			var difPercent = 0;
			swEval = false;
			console.log("PRUEBA VALOR " + price);
			debug = 0;
			console.log("Volumen estimado: " + vol);
			for(let dato of arrOrionBuyXLMCLP){
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
						vol = indexOrionBalance['BTC'].availableBalance / 800000000;
						vol = (vol / price);
						vol += indexOrionBalance['XLM'].availableBalance / 10000000/* - 200*/;
						vol = vol > 500 ? 500 : vol;
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
          console.log((order.limitPrice / 100000000) + ' - ' + arrOrionBuyXLMBTC[index].px);
          console.log((order.limitPrice / 100000000) - arrOrionBuyXLMBTC[index].px);
          if(priceLibro != (order.limitPrice / 100000000) || (order.limitPrice / 100000000) - arrOrionBuyXLMBTC[index].px > 0.00000002){
            await fnCancelOrderOrion(order);
            console.log('eliminada');
          }
          
        } else {
          console.log('EVALUANDO');
          
          console.log(arrOrionSellXLMBTC[0].px + ' < ' +  (order.limitPrice / 100000000));
          console.log(arrOrionBuyXLMCLP[0].px + ' > ' + arrOrionSellXLMBTC[0].px);
          console.log(arrOrionSellXLMCLP[0].px + " > " + (order.limitPrice / 100000000));
		  
          console.log(arrOrionSellXLMBTC[0].px  <  (order.limitPrice / 100000000));		  
          console.log(arrOrionBuyXLMCLP[0].px >  arrOrionSellXLMBTC[0].px);
          console.log((arrOrionSellXLMBTC[1].px  - arrOrionSellXLMBTC[0].px)  > 0.0000001);
          console.log(arrOrionSellXLMCLP[0].px > (order.limitPrice / 100000000));
          console.log('EVALUANDO');

          if(arrOrionSellXLMBTC[0].px < (order.limitPrice / 100000000)  || 
						arrOrionBuyXLMCLP[0].px > arrOrionSellXLMBTC[0].px     || 
						arrOrionSellXLMCLP[0].px > (order.limitPrice / 100000000)){
				
            await fnCancelOrderOrion(order);
            console.log('eliminada');
          }
        }
      }
      
      
      console.log("Orion XLMCLP Buy: " + arrOrionBuyXLMCLP[0].px);
      console.log("Orion XLMCLP Sell: " + arrOrionSellXLMCLP[0].px);
      console.log("Orion XLMBTC Buy: " + arrOrionBuyXLMBTC[0].px);
      console.log("Orion XLMBTC Sell: " + arrOrionSellXLMBTC[0].px);
      
			console.log("indexOrionBalance BTC: " + indexOrionBalance['BTC'].availableBalance);
			console.log(indexOrionBalance['BTC']);
	  
      if(!orderOrion){
        console.log("Sin Orden");
        console.log(arrOrionBuyXLMCLP[0].px - arrOrionBuyXLMBTC[0].px > 0.000001);
        console.log(1 - (arrOrionBuyXLMBTC[0].px / arrOrionBuyXLMCLP[0].px) > 0.1);
		
		
		
		
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
          console.log(arrOrionBuyXLMCLP[0].px - arrOrionBuyXLMBTC[0].Price > 0.000001);
          console.log(1 - arrOrionBuyXLMBTC[0].px / arrOrionBuyXLMCLP[0].px > 0.1);
          console.log('1 - ' + arrOrionBuyXLMBTC[0].px + ' / ' + arrOrionBuyXLMCLP[0].px + ' > ' + 0.1);
		  
		  
		  
          if(swDif){
            console.log("Creando Orden");
            vol = indexOrionBalance['BTC'].availableBalance / 800000000;
            vol = (vol / price);
			vol = vol > 500 ? 500 : vol;
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
		query: 'mutation {placeLimitOrder(marketCode: "XLMBTC", amount:' + (qty * 10000000) + ', limitPrice: ' + Math.round(price * 100000000) + ', sell:' + (tipo == 'buy' ? false : true) + '){_id __typename }}'
	  
	  };
	console.log("CREANDO ORDEN EN ORION DE PRECIO: " + price + " y volumen: " + qty);
  
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
  for(let datSo of arrOrionSellXLMBTC){
    var datOr = arrOrionBuyXLMCLP[i];
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
	console.log("PRECIO arrOrionBuyXLMCLP: " + datOr.px);
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
	if(qty > indexOrionBalance['XLM'].availableBalance){
		qty = indexOrionBalance['XLM'].availableBalance;
	}
	
	
	var queryRemate = {
				query: 'mutation {  ini: placeMarketOrder(marketCode: "XLMBTC", amount: ' + qty + ', sell: false) {    _id    __typename  }, fin: placeMarketOrder(marketCode: "XLMCLP", amount: ' + (qty * 0.9961) + ', sell: true) {    _id    __typename  }}'
			};
			
	fs.appendFileSync('./data3.txt', JSON.stringify(queryRemate) + "\n", (err) => {
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




function fnOrden(points) {
    points = points.sort(function(a, b){return a-b});
	points = points.reverse();
    
}



async function fnOrdenesOrion(){
	let query4 = {                        
		query: `{
  orders(marketCode: "XLMBTC", onlyOpen: true, limit: 0) {
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
			
			//orden.Ordenes
			//ordenes.update({ _id: '5b7642c2b69777cb02311638' }, { $set: { size: 'large' }}, callback);
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
		

	}	
}

async function fnTradesOrion(){
	let query3 = {                        
		query: `query{
  historyXLMBTC: marketTradeHistory(marketCode: "XLMBTC") {
    _id
    amount
    price
    date
    __typename
  }
  historyXLMCLP: marketTradeHistory(marketCode: "XLMCLP") {
    _id
    amount
    price
    date
    __typename
  }
}`
  };
	
	
	var data = await main(query3);
	
	//console.log(data.data.historyXLMBTC);
	
	tradesOrionXLMBTC = data.data.historyXLMBTC;
	
	
	tradesOrionXLMCLP = data.data.historyXLMCLP;
}

async function fnLibrosOrion(){
	let query = {                        
		query: `query{XLMCLP: marketOrderBook(marketCode: "XLMCLP", limit:100){buy{limitPrice amount accumulated} sell{limitPrice amount accumulated} spread}, 
		XLMBTC: marketOrderBook(marketCode: "XLMBTC", limit:100){buy{limitPrice amount accumulated} sell{limitPrice amount accumulated} spread},
		BTCCLP: marketOrderBook(marketCode: "BTCCLP", limit:100){buy{limitPrice amount accumulated} sell{limitPrice amount accumulated} spread}
		}`
	};

	var libroOrion = await main(query);	
	
	//console.log(libroOrion);
	
	//for()
	arrOrionBuyXLMBTC = libroOrion.data.XLMBTC.buy;
	arrOrionSellXLMBTC = libroOrion.data.XLMBTC.sell;

	arrOrionBuyXLMCLP = libroOrion.data.XLMCLP.buy;
	arrOrionSellXLMCLP = libroOrion.data.XLMCLP.sell;	
	
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

  if(indexOrionBalance['XLM'].availableBalance > 0){
		/*var queryRemate2 = {
					query: 'mutation {  remate:placeMarketOrder(marketCode: "XLMCLP", amount: ' + indexOrionBalance['XLM'].availableBalance + ', sell: true) {    _id    __typename  }, recuperacion: placeMarketOrder(marketCode: "BTCCLP", amount: ' + ((btcRef * qty / btcRef) * 1.0039) + ', sell: false) {    _id    __typename  }}'
				};
				
*/
		var queryRemate2 = {
			query:`mutation {  
										remate:placeMarketOrder(marketCode: "XLMCLP", amount:  ` + indexOrionBalance['XLM'].availableBalance + `, sell: true) 
										{   
											_id
											amount
											limitPrice
											filled
											status
											trades{	
												amount
												price
												totalCost
												
											}	
										}	
									}		
			`
			};
			fs.appendFileSync('./remate.txt', JSON.stringify(queryRemate2) + "\n", (err) => {
				if (err) throw err;
					console.log('The "data to append" was appended to file!');
			});		
					
			
			//console.log());
			var respOrder =  await main(queryRemate2);
			var evalOrder = respOrder.data.remate._id;
			do{
				var queryRemate2 = {
					query:`query{
						order(orderId:"` + evalOrder + `"){
								
														_id
														amount
														limitPrice
														filled
														status
														trades{	
															amount
															price
															totalCost
															
														}	
													}	
						}
					`
					};
			
				respOrder =  await main(queryRemate2);
			
		} while(respOrder.data.order.status != 'closed');
		var qty = 0;
		for(let obj of respOrder.data.order.trades){
			qty += obj.totalCost;
		}
		queryRemate2 = {
			query:`mutation {  
										remate:placeMarketOrder(marketCode: "BTCCLP", amount:  ` + qty + `, sell: false) 
										{   
											_id
											amount
											limitPrice
											filled
											status
											trades{	
												amount
												price
												totalCost
												
											}	
										}	
									}		
			`
			};
		console.log(indexOrionBalance);
		//exit
	}
}