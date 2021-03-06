'use strict'

const binance = require('node-binance-api');
binance.options({
  'APIKEY':'tfdrBVQrUdxkvRLDaMA6HnmTSNMBSlZcnDkPDLdjOGdecEJaVYxDZFugmzH5H1wb',
  'APISECRET':'0sxAG7s1t9YHxCBFJ91NiKyC1CKpZiA4rYyrR9sxAEwaxxhlXfR3aKUmkVMs41Dc',
  useServerTime: true,
  log: log => {
    console.log(log); // You can create your own logger here, or disable console output
  }
});

var EventEmitter = require('events').EventEmitter;
var ee = new EventEmitter();
ee.on("normal", fnNormal);
ee.on("remate", fnRemateFallo);

var ev = "normal";

var objDecimales = {BNBBTC: 2, ONTBTC: 0, NEOBTC: 2, 
					BNBUSDT: 2, NEOUSDT: 3, BTCUSDT: 6, ETHUSDT: 5, LTCUSDT: 5, BCCUSDT: 5, 
					BCCBNB: 5, CNDBNB: 2, NEOBNB: 3, IOTABNB: 2, NANOBNB: 2, LTCBNB: 5, NCACHBNB: 2, VENBNB: 2, ADXBNB: 2, ONTBNB: 2, XLMBNB: 2, ICXBNB: 2, STORMBNB: 2, GTOBNB: 2, AIONBNB: 2, BCPTBNB: 2, NULSBNB: 2, AEBNB: 2, OSTBNB: 2, YOYOBNB: 2, MCOBNB: 2, LSKBNB: 2, VIABNB: 2, NEBLBNB: 2, ZILBNB: 2, WTCBNB: 2, APPCBNB: 2, QSPBNB: 2, BTSBNB: 2, DLTBNB: 2, RPXBNB: 2, POWRBNB: 2, RLCBNB: 2, POABNB: 2, BLZBNB: 2, WABIBNB: 2, BRDBNB: 2, CMTBNB: 2, STEEMBNB: 2, AMBBNB: 2, WAVESBNB: 2, TRIGBNB: 2, XZCBNB: 3, NAVBNB: 2, BATBNB: 2, RDNBNB: 2, RCNBNB: 2, PIVXBNB: 2,
					LTCETH: 3
					};



const cluster = require('cluster');
var swOrd = true;

var ord1 = {};
var ord2 = {};



function balance_update(data) {
	console.log("Balance Update");
	for ( let obj of data.B ) {
		let { a:asset, f:available, l:onOrder } = obj;
		if ( available == "0.00000000" ) continue;
		var balance = asset+"\tavailable: "+available+" ("+onOrder+" on order)";
		console.log(balance);
		fsBalance.appendFileSync('./Balance.txt', balance + " \n", (err) => {
			if (err) throw err;
				////console.log('The "data to append" was appended to file!');
			}); 
	}
	
	fsBalance.appendFileSync('./Balance.txt', "\n\n\n\n\n", (err) => {
			if (err) throw err;
				////console.log('The "data to append" was appended to file!');
			})
}


function execution_update(data) {
	let { x:executionType, s:symbol, p:price, q:quantity, S:side, o:orderType, i:orderId, X:orderStatus } = data;
	
	if(executionType == 'FILLED'){
		if(result < 0){
			opG = op;
			ev = 'remate';
			swOrd = true;
		} else {
			fnRemate(qty2, px2, qty3, px3, symbol1, symbol2, msg, op);	
		}
		
		order = null;
	} else if(executionType == 'PARTIALLY_FILLED'){
		if(result == -10){
			fsLauncher.appendFileSync('./bin3.txt', "ORDEN TAPADA \n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
		} else {
			opG = op;
			ev = 'remate';
			
		}
		swOrd = true;
	}
	
	
	fsBalance.appendFileSync('./Balance.txt', JSON.stringify(data) + " \n", (err) => {
		if (err) throw err;
			////console.log('The "data to append" was appended to file!');
		});	
	if ( executionType == "NEW" ) {
		if ( orderStatus == "REJECTED" ) {
			console.log("Order Failed! Reason: "+data.r);
		}
		console.log(symbol+" "+side+" "+orderType+" ORDER #"+orderId+" ("+orderStatus+")");
		fsBalance.appendFileSync('./Balance.txt', symbol+" "+side+" "+orderType+" ORDER #"+orderId+" ("+orderStatus+")" + " \n", (err) => {
		if (err) throw err;
			////console.log('The "data to append" was appended to file!');
		});
		console.log("..price: "+price+", quantity: "+quantity);
		fsBalance.appendFileSync('./Balance.txt', "..price: "+price+", quantity: "+quantity + " \n", (err) => {
		if (err) throw err;
			////console.log('The "data to append" was appended to file!');
		});
		return;
	}
	//NEW, CANCELED, REPLACED, REJECTED, TRADE, EXPIRED
	console.log(symbol+"\t"+side+" "+executionType+" "+orderType+" ORDER #"+orderId);
	fsBalance.appendFileSync('./Balance.txt', symbol+"\t"+side+" "+executionType+" "+orderType+" ORDER #"+orderId + " \n", (err) => {
		if (err) throw err;
			////console.log('The "data to append" was appended to file!');
		});
}

binance.websockets.userData(balance_update, execution_update);

binance.websockets.depthCache(["ETHUSDT"], function(symbol, depth) {
	let max = 10; // Show 10 closest orders only
	let bids = binance.sortBids(depth.bids, max);
	let asks = binance.sortAsks(depth.asks, max);
	/*console.log(symbol+" depth cache update");
	console.log("asks", asks);
	console.log("bids", bids);
	console.log("ask: "+binance.first(asks));
	console.log("bid: "+binance.first(bids));*/
	fnCruce('bin', asks, 'ETHUSDT', 'buy');
	fnCruce('bin', bids, 'ETHUSDT_', 'sell');
	
	/*var volAnt = 0;
	for(let obj in asks){
		console.log(obj);
		volAnt += Number(asks[obj]);	
		console.log(volAnt);
		
	}*/
	
});



binance.websockets.depthCache(["LTCETH"], function(symbol, depth) {
	let max = 10; // Show 10 closest orders only
	let bids = binance.sortBids(depth.bids, max);
	let asks = binance.sortAsks(depth.asks, max);
	/*console.log(symbol+" depth cache update");
	console.log("asks", asks);
	console.log("bids", bids);
	console.log("ask: "+binance.first(asks));
	console.log("bid: "+binance.first(bids));*/
	fnCruce('bin', asks, 'LTCETH', 'buy');
	fnCruce('bin', bids, 'LTCETH_', 'sell');
});

binance.websockets.depthCache(["LTCUSDT"], function(symbol, depth) {
	let max = 10; // Show 10 closest orders only
	let bids = binance.sortBids(depth.bids, max);
	let asks = binance.sortAsks(depth.asks, max);
	/*console.log(symbol+" depth cache update");
	console.log("asks", asks);
	console.log("bids", bids);
	console.log("ask: "+binance.first(asks));
	console.log("bid: "+binance.first(bids));*/
	fnCruce('bin', bids, 'LTCUSDT', 'sell');
	fnCruce('bin', asks, 'LTCUSDT_', 'buy');
});






var fsLauncher = require('fs');
var fsBalance = require('fs');

var validacionDatos = {};
var sw = false;
var acum = 0;
var acum2 = 0;
var countOrd = 0;
var order;


function fnCancel(qty2, px2, qty3, px3, symbol1, symbol2, msg){
	/*if(swOrd == true){
		swOrd = false;*/
		console.log("CANCELACION DE ORDEN " + order.orderId);
		binance.cancel(order.symbol, order.orderId, (error, response, symbol) => {
		  //console.log(symbol+" cancel response:", response);
			fsLauncher.appendFileSync('./bin3.txt', "CANCELACION DE ORDEN " + order.orderId + '\n' + msg + '\n' + JSON.stringify(response) + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						}); 
			if(error && error.body){
				console.log(error.body);
				fsLauncher.appendFileSync('./bin3.txt', JSON.stringify(error.body) + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});  
				swOrd = true;
			  } else {
				order = null;  
			  }
			  swOrd = true;
		});
	//}
	
	
	
}

var str;
function fnNormal(){
	if(validacionDatos['ETHUSDT'] && validacionDatos['LTCETH'] && validacionDatos['LTCUSDT']
	&& validacionDatos['ETHUSDT_'] && validacionDatos['LTCUSDT_'] && validacionDatos['LTCETH_']
	){
		//console.log(order);
		
		if(order != null){
			
			/*if(order.price < binance.first(validacionDatos['ETHUSDT']).data && order.side == 'BUY'){
				binance.cancel(order.symbol, order.orderId, (error, response, symbol) => {
				  //console.log(symbol+" cancel response:", response);
					order = null;
				});
			} else if(order.price > binance.first(validacionDatos['ETHUSDT_']).data && order.side == 'SELL'){
				binance.cancel(order.symbol, order.orderId, (error, response, symbol) => {
				  //console.log(symbol+" cancel response:", response);
					order = null;
				});
			}
			*/
			if(order.orderId != null){
				console.log("EXISTE " + order.orderId);
				if(order.symbol == 'LTCETH'){
					console.log("ORDER: " + countOrd);
					
					var qty2 = 0.1;//qty1 * 0.999 / order.price;//lowestAsk;
					str = String(qty2).split(".");
					qty2 = 0.1;//Number(str[0] + '.' + str[1].substr(0, objDecimales['LTCETH']))
					
					var px2 = order.price;//lowestAsk;
					var amount2 = qty2 * px2 * 0.999;
					amount2 = amount2.toFixed(8);
					//console.log("px: " + px2 + ", qty: " + qty2 + ", amount: " + amount2);
					
					
					var qty1 = ((qty2 * px2) / 0.999) + Math.pow(10, -objDecimales['ETHUSDT']);//11.9 / Number(binance.first(validacionDatos['ETHUSDT'].data));
					str = String(qty1).split(".");
					
					qty1 = Number(str[0] + '.' + str[1].substr(0, objDecimales['ETHUSDT']));
					//qty1 = qty1.toFixed(objDecimales['ETHUSDT']);
					var px1 = binance.first(validacionDatos['ETHUSDT'].data);
					var amount1 = qty1 * px1;// * 0.999;
					amount1 = amount1.toFixed(8);
					//console.log(binance.first(validacionDatos['ETHUSDT_'].data));
					//console.log("px: " + px1 + ", qty: " + qty1 + ", amount: " + amount1);
								
					var qty3 = qty2 * 0.999;// * binance.first(validacionDatos['LTCETH_'].data);
					str = String(qty3).split(".");
					qty3 = Number(str[0] + '.' + str[1].substr(0, objDecimales['LTCUSDT']))
					
					var px3 = binance.first(validacionDatos['LTCUSDT'].data);
					var amount3 = qty3 * px3 * 0.999;
					amount3 = amount3.toFixed(8);
					//console.log("px: " + px3 + ", qty: " + qty3 + ", amount: " + amount3);
					var result = amount3;
					//console.log(result);
					result = result - amount1;
					//console.log("RES: " + ((qty1 * px1) - amount3));
					
					//result = qty1 - amount;
					
					var volAnt = 0;
					for(let obj in validacionDatos['LTCETH_'].data){
						if(order.price == validacionDatos['LTCETH_'].data[obj]){
							break;
						} else {
							volAnt += Number(validacionDatos['LTCETH_'].data[obj]);	
						}
						
					}
					console.log("[ " + result + " ]");
					
					if(result < 0){
						
						fnCancel(qty1, px1, qty3, px3, 'ETHUSDT', 'LTCUSDT', " Se Pierde dif: " + result);
						//fnConsulta(qty1, px1, qty3, px3, 'ETHUSDT', 'LTCUSDT', " Se Pierde dif: " + result, result, 'buy');
						
					} else if(volAnt > order.origQty * 500 && order.status == 'NEW'){
						fnCancel(qty1, px1, qty3, px3, 'ETHUSDT', 'LTCUSDT', " Se Pierde Posicion");
						//fnConsulta(qty1, px1, qty3, px3, 'ETHUSDT', 'LTCUSDT', " Se Pierde Posicion", -10, 'buy');
					} else {
						//fnConsulta(qty1, px1, qty3, px3, 'ETHUSDT', 'LTCUSDT', " COnsulta ordinaria ", 10, 'buy');
					}
					
					
				} else if(order.symbol == 'LTCUSDT'){
					
					var qty5 = 0.1;//amount4 / order.price;//lowestAsk;
					str = String(qty5).split(".");
					qty5 = Number(str[0] + '.' + str[1].substr(0, objDecimales['LTCUSDT']))
					
					
					var px5 = order.price;//lowestAsk;
					var amount5 = qty5 * px5 * 0.999;
					amount5 = amount5.toFixed(8);
					//console.log("px: " + px5 + ", qty: " + qty5 + ", amount: " + amount5);
					
					var qty4 = (qty5 * px5 / 0.999) / (Number(binance.first(validacionDatos['ETHUSDT_'].data)));//11.9 / Number(binance.first(validacionDatos['ETHUSDT_'].data));
					str = String(qty4).split(".");
					qty4 = Number(str[0] + '.' + str[1].substr(0, objDecimales['ETHUSDT']))
					
					var px4 = binance.first(validacionDatos['ETHUSDT_'].data);
					var amount4 = qty4 * px4 * 0.999;
					amount4 = amount4.toFixed(8);
					//console.log(binance.first(validacionDatos['ETHUSDT_'].data));
					//console.log("px: " + px4 + ", qty: " + qty4 + ", amount: " + amount4);
					
					var qty6 = qty5 * 0.999;// * binance.first(validacionDatos['LTCETH_'].data);
					str = String(qty6).split(".");
					qty6 = Number(str[0] + '.' + str[1].substr(0, objDecimales['LTCETH']))
					
					
					var px6 = binance.first(validacionDatos['LTCETH_'].data);
					var amount6 = qty6 * px6 * 0.999;
					amount6 = amount6.toFixed(8);
					//console.log("px: " + px6 + ", qty: " + qty6 + ", amount: " + amount6);
					var result2 = amount6;
					console.log(result2);
					result2 = result2 - qty4;
					console.log("RES2: " + ((qty4) - amount6));
					var volAnt = 0;
					for(let obj in validacionDatos['LTCETH_'].data){
						if(order.price == validacionDatos['LTCETH_'].data[obj]){
							break;
						} else {
							volAnt += Number(validacionDatos['LTCETH_'].data[obj]);	
						}
						
					}
					console.log("[ " + result2 + " ]");
					if(result2 < 0){
						
						fnCancel(qty4, px4, qty6, px6, 'ETHUSDT', 'LTCETH', " Se Pierde dif: " + result2);
						//fnConsulta(qty4, px4, qty6, px6, 'ETHUSDT', 'LTCETH', " Se Pierde dif: " + result2, result2, 'sell');
						
					} else if(volAnt > order.origQty * 500 && order.status == 'NEW'){
						fnCancel(qty4, px4, qty6, px6, 'ETHUSDT', 'LTCETH', " Se Pierde Posicion");
						//fnConsulta(qty4, px4, qty6, px6, 'ETHUSDT', 'LTCETH', " Se Pierde Posicion", -10, 'sell');
					} else {
						//fnConsulta(qty4, px4, qty6, px6, 'ETHUSDT', 'LTCETH', " Consulta ordinaria", 10, 'sell');
					}
					
				}			
					
			} else {
				console.log("EXISTE ");
			}
			
		} else {
			console.log("NO EXISTE");
			swOrd = true;
			//console.log("ORDER: " + countOrd);
			var qty2 = 0.1;//qty1 * 0.999 / binance.first(validacionDatos['LTCETH_'].data);//lowestAsk;
			str = String(qty2).split(".");
			qty2 = Number(str[0] + '.' + str[1].substr(0, objDecimales['LTCETH']))
			var px2 = binance.first(validacionDatos['LTCETH_'].data);//lowestAsk;
			var amount2 = qty2 * px2 * 0.999;
			amount2 = amount2.toFixed(8);
			//console.log("px: " + px2 + ", qty: " + qty2 + ", amount: " + amount2);
			
			var qty1 = ((qty2 * px2) / 0.999) + Math.pow(10, -objDecimales['ETHUSDT']);//lowestAsk; //11.9 / (Number(binance.first(validacionDatos['ETHUSDT'].data)) + 0.000001);
			str = String(qty1).split(".");
			qty1 = Number(str[0] + '.' + str[1].substr(0, objDecimales['ETHUSDT']));
			//qty1 = qty1.toFixed(objDecimales['ETHUSDT']);
			//console.log(qty1);
			var px1 = binance.first(validacionDatos['ETHUSDT'].data);
			var amount1 = qty1 * px1;// * 0.999;
			amount1 = amount1.toFixed(8);
			//console.log(binance.first(validacionDatos['ETHUSDT_'].data));
			//console.log("px: " + px1 + ", qty: " + qty1 + ", amount: " + amount1);
			
			
			
			
			var qty3 = qty2 * 0.999;// * binance.first(validacionDatos['LTCETH_'].data);
			str = String(qty3).split(".");
			qty3 = Number(str[0] + '.' + str[1].substr(0, objDecimales['LTCUSDT']))
			var px3 = binance.first(validacionDatos['LTCUSDT'].data);
			var amount3 = qty3 * px3 * 0.999;
			amount3 = amount3.toFixed(8);
			//console.log("px: " + px3 + ", qty: " + qty3 + ", amount: " + amount3);
			var result = amount3;
			//console.log(result);
			result = result - amount1;
			//console.log("RES: " + ((qty1 * px1) - amount3));
			
			
			
			
			
			
			var qty5 = 0.1;//amount4 / binance.first(validacionDatos['LTCUSDT'].data);//lowestAsk;
			
			str = String(qty5).split(".");
			qty5 = Number(str[0] + '.' + str[1].substr(0, objDecimales['LTCUSDT']))
					
			var px5 = binance.first(validacionDatos['LTCUSDT'].data);//lowestAsk;
			var amount5 = qty5 * px5 * 0.999;//----> USDT
			amount5 = amount5.toFixed(8);
			//console.log("px: " + px5 + ", qty: " + qty5 + ", amount: " + amount5);
			
			var qty4 = (qty5 * px5 / 0.999) / (Number(binance.first(validacionDatos['ETHUSDT_'].data)));//11.9 / (Number(binance.first(validacionDatos['ETHUSDT_'].data)) - 0.000001)
			str = String(qty4).split(".");
			qty4 = Number(str[0] + '.' + str[1].substr(0, objDecimales['ETHUSDT']))
			var px4 = binance.first(validacionDatos['ETHUSDT_'].data);
			var amount4 = qty4 * px4 * 0.999;
			amount4 = amount4.toFixed(8);
			//console.log(binance.first(validacionDatos['ETHUSDT_'].data));
			//console.log("px: " + px4 + ", qty: " + qty4 + ", amount: " + amount4);
			
			var qty6 = qty5 * 0.999;// * binance.first(validacionDatos['LTCETH_'].data);
			
			str = String(qty6).split(".");
			//console.log(qty6)
			qty6 = Number(str[0] + '.' + str[1].substr(0, objDecimales['LTCETH']))
			var px6 = binance.first(validacionDatos['LTCETH_'].data);
			var amount6 = qty6 * px6 * 0.999;
			amount6 = amount6.toFixed(8);
			//console.log("px: " + px6 + ", qty: " + qty6 + ", amount: " + amount6);
			var result2 = amount6;
			//console.log(result2);
			result2 = result2 - qty4;
			//console.log("RES2: " + ((qty4) - amount6));
			
			if(result > 0.000001 && result > result2){
				order = {};
				console.log('\u0007');
				
				
				
				console.log('qty2: ' + qty2);
				binance.buy("LTCETH", qty2, px2, {type:'LIMIT'}, (error, response) => {
				
					countOrd++;
					console.log("Limit Buy response", response);
					fsLauncher.appendFileSync('./bin3.txt',"Limit Buy response, " + JSON.stringify(response) + " \n", (err) => {
							if (err) throw err;
								////console.log('The "data to append" was appended to file!');
							});
					console.log("order id: " + response.orderId);
					if(error && error.body){
						console.log(error.body);
						order = null;
						fsLauncher.appendFileSync('./bin3.txt', 'ETHUSDT\n' + JSON.stringify(error.body) + " \n", (err) => {
							if (err) throw err;
								////console.log('The "data to append" was appended to file!');
							});  
					} else {
						order = response;
						if(order.status == 'FILLED'){
							fnRemate(qty1, px1, qty3, px3, "ETHUSDT", "LTCUSDT", 'xxxx', 'buy');
							order = null;
						} else {
							ord1 = {px: px1, qty: qty1, symbol: 'ETHUSDT'};
							ord2 = {px: px3, qty: qty3, symbol: 'LTCUSDT'};
							fnConsulta(qty1, px1, qty3, px3, "ETHUSDT", "LTCUSDT", 'ConsultaOrdinaria', result, 'buy');
						}
					}
					
					
					
					
					
				  
					
					console.log("ORDER: " + countOrd);
				  
				
					
				  
				  
				});
				
				
			}
			
			
			if(result2 > 0.000001){
				order = {};
				console.log('\u0007');
				binance.buy("LTCUSDT", qty5, px5, {type:'LIMIT'}, (error, response) => {
					
				  countOrd++;
				  console.log("Limit Buy response", response);
				  fsLauncher.appendFileSync('./bin3.txt',"Limit Buy response, " + JSON.stringify(response) + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});
				  console.log("order id: " + response.orderId);
				  if(error && error.body){
					console.log(error.body);
					fsLauncher.appendFileSync('./bin3.txt', 'LTCUSDT\n' + JSON.stringify(error.body) + " \n", (err) => {
							if (err) throw err;
								////console.log('The "data to append" was appended to file!');
							});  
				  } else {
						order = response;
						if(order.status == 'FILLED'){
							fnRemate(qty4, px4, qty6, px6, "ETHUSDT", "LTCETH", 'xxxx', 'sell');
							order = null;
						} else {
							ord1 = {px: px4, qty: qty4, symbol: 'ETHUSDT'};
							ord2 = {px: px6, qty: qty6, symbol: 'LTCETH'};
							fnConsulta(qty4, px4, qty6, px6, "ETHUSDT", "LTCETH", 'Consulta Ordinaria INI', result2, 'sell');
						}
				  }	
				  
				  console.log("ORDER: " + countOrd);
				});
				
				
				
			}
			
			
		
			if(((result > 0 ) || (result2 > 0 )) && !sw){
				//console.log("*********************************************");
				console.log("[ " + result + " :: " + result2 + " ]");
				sw = true;
				acum += Number(result) > 0 ? Number(result) : 0;
				acum2 += Number(result2) > 0 ? Number(result2) : 0;
				
				fsLauncher.appendFileSync('./bin3.txt', " [ " + (acum) + " :: " + (acum2) + " ]\n", (err) => {
							if (err) throw err;
								////console.log('The "data to append" was appended to file!');
							});
			}
			if(result < 0 && sw){
				//console.log("*********************************************");
				sw = false;
			}
			console.log("[ " + result + " :: " + result2 + " ]");
			
		}
		
		
		
	} /*else {
		if(swOrd && order && order.orderId){
			
			console.log("******** consultando orden " + order.orderId + " ******* --> " + swOrd);
			fnConsulta();	
		}
		
	}*/
	
}
var objOrdenRemateFallo = {};
var opG;
function fnRemateFallo(){
	ee.removeListener('remate', fnRemateFallo);
	
	
	
	//console.log('qty2: ' + ord1.qty);
		fsLauncher.appendFileSync('./bin3.txt',"ORDEN VENTA, " + ord1.symbol + ", " + ord1.qty + ", " + ord1.px + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});
						
	
	binance[opG](ord1.symbol, ord1.qty, ord1.px, {type:'LIMIT'}, (error, response) => {
		
	  console.log("Limit Buy response", response);
	  fsLauncher.appendFileSync('./bin3.txt',"Limit Buy response, " + JSON.stringify(response) + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});
	  console.log("order id: " + response.orderId);
	  if(error && error.body){
		console.log(error.body);
		fsLauncher.appendFileSync('./bin3.txt', ord1.symbol + '\n' + JSON.stringify(error.body) + " \n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});  
	  } else {
		  objOrdenRemateFallo[response.orderId] = response;
		  var s = 0;
		  for(let str in objOrdenRemateFallo){
			  s++;
		  }
		  if(s == 2){
			ee.on('remate', fnEspera); 
		  }
	  }
	  
	  console.log("ORDER: " + countOrd);
	});
	
	console.log('qty3: ' + ord2.qty);
	fsLauncher.appendFileSync('./bin3.txt',"ORDEN VENTA, " + ord2.symbol + ", " + ord2.qty + ", " + ord2.px + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});
	binance.sell(ord2.symbol, ord2.qty, ord2.px, {type:'LIMIT'}, (error, response) => {
		
		console.log("Limit Buy response", response);
		fsLauncher.appendFileSync('./bin3.txt',"Limit Buy response, " + JSON.stringify(response) + " \n", (err) => {
							if (err) throw err;
								////console.log('The "data to append" was appended to file!');
							});
		console.log("order id: " + response.orderId);
		if(error && error.body){
			console.log(error.body);
			fsLauncher.appendFileSync('./bin3.txt', ord2.symbol + '\n' + JSON.stringify(error.body) + " \n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});  
		} else {
			objOrdenRemateFallo[response.orderId] = response;
			var s = 0;
			for(let str in objOrdenRemateFallo){
				s++;
			}
			if(s == 2){
				ee.on('remate', fnEspera); 
			}
		}
		  
		console.log("ORDER: " + countOrd);
		  
	});


	
}


function fnEspera(){
	ee.removeListener('remate', fnEspera);
	
	for(let str in objOrdenRemateFallo){
		console.log(str);
		var ordA = objOrdenRemateFallo[str];
		binance.orderStatus(ordA.symbol, ordA.orderId, (error, orderStatus, symbol) => {
			console.log(symbol + " order status:", orderStatus);
			fsLauncher.appendFileSync('./bin3.txt', symbol + " order status: " + JSON.stringify(orderStatus) + " \n", (err) => {
					if (err) throw err;
						////console.log('The "data to append" was appended to file!');
					});  
			console.log("******** consultando orden " + ordA.orderId + " ******* --> " + swOrd);
			if(error && error.body){
				console.log(error.body);
				
				fsLauncher.appendFileSync('./bin3.txt', JSON.stringify(error.body) + " \n", (err) => {
					if (err) throw err;
						////console.log('The "data to append" was appended to file!');
					});  
				console.log("******** ERROR EN BUSQUEDA " + ordA.orderId + " ******* --> " + swOrd);
				swOrd = true;
				
			}
			
			if(orderStatus.status == 'FILLED'){
				delete objOrdenRemateFallo[orderStatus.orderId];
				
				var s = 0;
				for(let str in objOrdenRemateFallo){
					s++;
				}
				if(s == 0){
					ev = 'normal'; 
				} else {
					
				}
				order = null;
			} else {
				ee.on('remate', fnEspera);
				console.log("******** Fin Consulta orden " + ordA.orderId + " ******* --> " + swOrd);
				swOrd = true;	
			}
			
		});	
	}
	
		
}




function fnCruce(orig, data, currencyPair, op){	
	if(!validacionDatos[currencyPair]){
		validacionDatos[currencyPair] = {};
		validacionDatos[currencyPair].op = op;	
	} 
	
	validacionDatos[currencyPair].data = data;
	//console.log(currencyPair);
	
	ee.emit(ev);
	
	
}


function fnRemate(qty2, px2, qty3, px3, symbol1, symbol2, msg, op){
	
	//console.log('qty2: ' + qty2);
	fsLauncher.appendFileSync('./bin3.txt',"ORDEN VENTA, " + symbol1 + ", " + qty2 + ", " + px2 + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});
						
	
	binance[op](symbol1, qty2, px2, {type:'LIMIT'}, (error, response) => {
		countOrd++;
	  console.log("Limit Buy response", response);
	  fsLauncher.appendFileSync('./bin3.txt',"Limit Buy response, " + JSON.stringify(response) + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});
	  console.log("order id: " + response.orderId);
	  if(error && error.body){
		console.log(error.body);
		fsLauncher.appendFileSync('./bin3.txt', 'LTCETH\n' + JSON.stringify(error.body) + " \n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});  
	  }
	  
	  console.log("ORDER: " + countOrd);
	});
	
	console.log('qty3: ' + qty3);
	fsLauncher.appendFileSync('./bin3.txt',"ORDEN VENTA, " + symbol2 + ", " + qty3 + ", " + px3 + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});
	binance.sell(symbol2, qty3, px3, {type:'LIMIT'}, (error, response) => {
		countOrd++;
	  console.log("Limit Buy response", response);
	  fsLauncher.appendFileSync('./bin3.txt',"Limit Buy response, " + JSON.stringify(response) + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});
	  console.log("order id: " + response.orderId);
	  if(error && error.body){
		console.log(error.body);
		fsLauncher.appendFileSync('./bin3.txt', 'LTCUSDT\n' + JSON.stringify(error.body) + " \n", (err) => {
			if (err) throw err;
				////console.log('The "data to append" was appended to file!');
			});  
	  }
	  
	  console.log("ORDER: " + countOrd);
	  
	});
	swOrd = true;
}


function fnConsulta(qty2, px2, qty3, px3, symbol1, symbol2, msg, result, op){
	
	if(swOrd == true){
		swOrd = false;
		binance.orderStatus(order.symbol, order.orderId, (error, orderStatus, symbol) => {
			console.log(symbol + " order status:", orderStatus);
			fsLauncher.appendFileSync('./bin3.txt', symbol + " DIF: " +  result + " order status: " + JSON.stringify(orderStatus) + " \n", (err) => {
					if (err) throw err;
						////console.log('The "data to append" was appended to file!');
					});  
			console.log("******** consultando orden " + order.orderId + " ******* --> " + swOrd);
			if(error && error.body){
				console.log(error.body);
				
				fsLauncher.appendFileSync('./bin3.txt', JSON.stringify(error.body) + " \n", (err) => {
					if (err) throw err;
						////console.log('The "data to append" was appended to file!');
					});  
				console.log("******** ERROR EN BUSQUEDA " + order.orderId + " ******* --> " + swOrd);
				swOrd = true;
				fnConsulta(qty2, px2, qty3, px3, symbol1, symbol2, msg, result, op);
			}
			order = orderStatus;
			if(orderStatus.status == 'FILLED'){
				if(result < 0){
					opG = op;
					ev = 'remate';
					swOrd = true;
				} else {
					fnRemate(qty2, px2, qty3, px3, symbol1, symbol2, msg, op);	
				}
				
				order = null;
			} else if(orderStatus.status == 'CANCELED'){
				console.log("******** Orden Cancelada " + order.orderId + " ******* --> " + swOrd);
				order = null;	
				swOrd = true;
			} else if(orderStatus.status == 'PARTIALLY_FILLED'){
				if(result == -10){
					fsLauncher.appendFileSync('./bin3.txt', "ORDEN TAPADA \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});
				} else {
					opG = op;
					ev = 'remate';
					
				}
				swOrd = true;
				
			} else if(orderStatus.status == 'NEW'){
				console.log("******** probando Cancel " + order.orderId + " ******* --> " + result);
				if(result < 0){
					fnCancel(qty2, px2, qty3, px3, symbol1, symbol2, msg);
				} else {
					swOrd = true;	
				}
				
			} else {
				console.log("******** Fin Consulta orden " + order.orderId + " ******* --> " + swOrd);
				swOrd = true;	
			}
			
		});	
	}
	
	
}


