const binance = require('node-binance-api');
binance.options({
  'APIKEY':'tfdrBVQrUdxkvRLDaMA6HnmTSNMBSlZcnDkPDLdjOGdecEJaVYxDZFugmzH5H1wb',
  'APISECRET':'0sxAG7s1t9YHxCBFJ91NiKyC1CKpZiA4rYyrR9sxAEwaxxhlXfR3aKUmkVMs41Dc',
  useServerTime: true,
  log: log => {
    console.log(log); // You can create your own logger here, or disable console output
  }
});



const cluster = require('cluster');
var swOrd = true;


binance.websockets.depthCache(["BTCUSDT"], function(symbol, depth) {
	let max = 10; // Show 10 closest orders only
	let bids = binance.sortBids(depth.bids, max);
	let asks = binance.sortAsks(depth.asks, max);
	/*console.log(symbol+" depth cache update");
	console.log("asks", asks);
	console.log("bids", bids);
	console.log("ask: "+binance.first(asks));
	console.log("bid: "+binance.first(bids));*/
	fnCruce('bin', asks, 'BTCUSDT', 'buy');
	fnCruce('bin', bids, 'BTCUSDT_', 'sell');
	
	/*var volAnt = 0;
	for(let obj in asks){
		console.log(obj);
		volAnt += Number(asks[obj]);	
		console.log(volAnt);
		
	}*/
	
});




binance.websockets.depthCache(["BNBBTC"], function(symbol, depth) {
	let max = 10; // Show 10 closest orders only
	let bids = binance.sortBids(depth.bids, max);
	let asks = binance.sortAsks(depth.asks, max);
	/*console.log(symbol+" depth cache update");
	console.log("asks", asks);
	console.log("bids", bids);
	console.log("ask: "+binance.first(asks));
	console.log("bid: "+binance.first(bids));*/
	fnCruce('bin', asks, 'BNBBTC', 'buy');
	fnCruce('bin', bids, 'BNBBTC_', 'sell');
});

binance.websockets.depthCache(["BNBUSDT"], function(symbol, depth) {
	let max = 10; // Show 10 closest orders only
	let bids = binance.sortBids(depth.bids, max);
	let asks = binance.sortAsks(depth.asks, max);
	/*console.log(symbol+" depth cache update");
	console.log("asks", asks);
	console.log("bids", bids);
	console.log("ask: "+binance.first(asks));
	console.log("bid: "+binance.first(bids));*/
	fnCruce('bin', bids, 'BNBUSDT', 'sell');
	fnCruce('bin', asks, 'BNBUSDT_', 'buy');
});






var fsLauncher = require('fs');

var validacionDatos = {};
var sw = false;
var acum = 0;
var acum2 = 0;
var countOrd = 0;
var order;


function fnCancel(qty2, px2, qty3, px3, symbol1, symbol2, msg){
	if(swOrd == true){
		swOrd = false;
		console.log("CANCELACION DE ORDEN " + order.orderId);
		binance.cancel(order.symbol, order.orderId, (error, response, symbol) => {
		  //console.log(symbol+" cancel response:", response);
			fsLauncher.appendFileSync('./bin2.txt', "CANCELACION DE ORDEN " + order.orderId + '\n' + msg + '\n' + JSON.stringify(response) + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						}); 
			if(error && error.body){
				console.log(error.body);
				fsLauncher.appendFileSync('./bin2.txt', JSON.stringify(error.body) + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});  
			  } else {
				order = null;  
			  }
			  swOrd = true;
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
	if(validacionDatos['BTCUSDT'] && validacionDatos['BNBBTC'] && validacionDatos['BNBUSDT']
	&& validacionDatos['BTCUSDT_'] && validacionDatos['BNBUSDT_'] && validacionDatos['BNBBTC_']
	){
		//console.log(order);
		if(order != null){
			
			/*if(order.price < binance.first(validacionDatos['BTCUSDT']).data && order.side == 'BUY'){
				binance.cancel(order.symbol, order.orderId, (error, response, symbol) => {
				  //console.log(symbol+" cancel response:", response);
					order = null;
				});
			} else if(order.price > binance.first(validacionDatos['BTCUSDT_']).data && order.side == 'SELL'){
				binance.cancel(order.symbol, order.orderId, (error, response, symbol) => {
				  //console.log(symbol+" cancel response:", response);
					order = null;
				});
			}
			*/
			if(order.orderId != null){
				if(order.side == 'BUY'){
					console.log("ORDER: " + countOrd);
					var qty1 = 11.9 / Number(binance.first(validacionDatos['BTCUSDT'].data));
					qty1 = Number(qty1.toFixed(6))
					var px1 = binance.first(validacionDatos['BTCUSDT'].data);
					var amount1 = qty1 * px1 * (1 - 0.001 / 0.999);
					//console.log(binance.first(validacionDatos['BTCUSDT_'].data));
					console.log("px: " + px1 + ", qty: " + qty1 + ", amount: " + amount1);
					var qty2 = qty1 * (1 - 0.001 / 0.999) / order.price;//lowestAsk;
					qty2 = Number(qty2.toFixed(2))
					var px2 = order.price;//lowestAsk;
					var amount2 = qty2 * px2 * (1 - 0.001 / 0.999);
					console.log("px: " + px2 + ", qty: " + qty2 + ", amount: " + amount2);			
					var qty3 = qty2 * (1 - 0.001 / 0.999);// * binance.first(validacionDatos['BNBBTC_'].data);
					qty3 = Number(qty3.toFixed(3));
					var px3 = binance.first(validacionDatos['BNBUSDT'].data);
					var amount3 = qty3 * px3 * (1 - 0.001 / 0.999);
					console.log("px: " + px3 + ", qty: " + qty3 + ", amount: " + amount3);
					var result = amount3;
					console.log(result);
					result = result - 11.9;
					console.log("RES: " + ((qty1 * px1) - amount3));
					var volAnt = 0;
					for(let obj in validacionDatos['BNBBTC_'].data){
						if(order.price == validacionDatos['BNBBTC_'].data[obj]){
							break;
						} else {
							volAnt += Number(validacionDatos['BNBBTC_'].data[obj]);	
						}
						
					}
					console.log("[ " + result + " ]");
					
					if(result < 0){
						
						//fnCancel(qty1, px1, qty3, px3, 'BTCUSDT', 'BNBUSDT', " Se Pierde dif: " + result);
						fnConsulta(qty1, px1, qty3, px3, 'BTCUSDT', 'BNBUSDT', " Se Pierde dif: " + result, result);
						
					} else if(volAnt > order.origQty * 5000 && order.status == 'NEW'){
						//fnCancel(qty1, px1, qty3, px3, 'BTCUSDT', 'BNBUSDT', " Se Pierde Posicion");
						fnConsulta(qty1, px1, qty3, px3, 'BTCUSDT', 'BNBUSDT', " Se Pierde Posicion", -10);
					}
					
					
				} else if(order.side == 'SELL'){
					var qty4 = 11.9 / Number(binance.first(validacionDatos['BTCUSDT_'].data));
					qty4 = Number(qty4.toFixed(6));
					var px4 = binance.first(validacionDatos['BTCUSDT_'].data);
					var amount4 = qty4 * px4 * (1 - 0.001 / 0.999);
					//console.log(binance.first(validacionDatos['BTCUSDT_'].data));
					console.log("px: " + px4 + ", qty: " + qty4 + ", amount: " + amount4);
					var qty5 = amount4 / order.price;//lowestAsk;
					qty5 = Number(qty5.toFixed(3));	
					var px5 = order.price;//lowestAsk;
					var amount5 = qty5 * px5 * (1 - 0.001 / 0.999);
					console.log("px: " + px5 + ", qty: " + qty5 + ", amount: " + amount5);
					var qty6 = qty5 * (1 - 0.001 / 0.999);// * binance.first(validacionDatos['BNBBTC_'].data);
					qty6 = Number(qty6.toFixed(2));
					var px6 = binance.first(validacionDatos['BNBBTC_'].data);
					var amount6 = qty6 * px6 * (1 - 0.001 / 0.999);
					console.log("px: " + px6 + ", qty: " + qty6 + ", amount: " + amount6);
					var result2 = amount6;
					console.log(result2);
					result2 = result2 - qty4;
					console.log("RES2: " + ((qty4) - amount6));
					var volAnt = 0;
					for(let obj in validacionDatos['BNBBTC_'].data){
						if(order.price == validacionDatos['BNBBTC_'].data[obj]){
							break;
						} else {
							volAnt += Number(validacionDatos['BNBBTC_'].data[obj]);	
						}
						
					}
					console.log("[ " + result2 + " ]");
					if(result2 < 0){
						
						//fnCancel(qty4, px4, qty6, px6, 'BTCUSDT', 'BNBBTC', " Se Pierde dif: " + result2);
						fnConsulta(qty4, px4, qty6, px6, 'BTCUSDT', 'BNBBTC', " Se Pierde dif: " + result2, result2);
						
					} else if(volAnt > order.origQty * 5000 && order.status == 'NEW'){
						//fnCancel(qty4, px4, qty6, px6, 'BTCUSDT', 'BNBBTC', " Se Pierde Posicion");
						fnConsulta(qty4, px4, qty6, px6, 'BTCUSDT', 'BNBBTC', " Se Pierde Posicion", -10);
					}
					
				}
				
				
				if(swOrd && order && order.orderId){
					
					console.log("******** consultando orden " + order.orderId + " ******* --> " + swOrd);
					if(order.side == 'BUY'){
						fnConsulta(qty1, px1, qty3, px3, 'BTCUSDT', 'BNBUSDT');		
					} else if(order.side == 'SELL'){
						fnConsulta(qty4, px4, qty6, px6, 'BTCUSDT', 'BNBBTC');		
					}
					
				}
				
				
					
			}
			
			
			
			
		} else {
			
			//console.log("ORDER: " + countOrd);
			var qty1 = 11.9 / (Number(binance.first(validacionDatos['BTCUSDT'].data)) + 0.000001);
			qty1 = Number(qty1.toFixed(6))
			var px1 = binance.first(validacionDatos['BTCUSDT'].data);
			var amount1 = qty1 * px1 * (1 - 0.001 / 0.999);
			//console.log(binance.first(validacionDatos['BTCUSDT_'].data));
			//console.log("px: " + px1 + ", qty: " + qty1 + ", amount: " + amount1);
			var qty2 = qty1 * (1 - 0.001 / 0.999) / binance.first(validacionDatos['BNBBTC_'].data);//lowestAsk;
			qty2 = Number(qty2.toFixed(2))
			var px2 = binance.first(validacionDatos['BNBBTC_'].data);//lowestAsk;
			var amount2 = qty2 * px2 * (1 - 0.001 / 0.999);
			//console.log("px: " + px2 + ", qty: " + qty2 + ", amount: " + amount2);
			
			
			var qty3 = qty2 * (1 - 0.001 / 0.999);// * binance.first(validacionDatos['BNBBTC_'].data);
			qty3 = Number(qty3.toFixed(3));
			var px3 = binance.first(validacionDatos['BNBUSDT'].data);
			var amount3 = qty3 * px3 * (1 - 0.001 / 0.999);
			//console.log("px: " + px3 + ", qty: " + qty3 + ", amount: " + amount3);
			var result = amount3;
			//console.log(result);
			result = result - 11.9;
			//console.log("RES: " + ((qty1 * px1) - amount3));
			
			
			
			
			
			
			
			
			var qty4 = 11.9 / (Number(binance.first(validacionDatos['BTCUSDT_'].data)) - 0.000001)
			qty4 = Number(qty4.toFixed(6));
			var px4 = binance.first(validacionDatos['BTCUSDT_'].data);
			var amount4 = qty4 * px4 * (1 - 0.001 / 0.999);
			//console.log(binance.first(validacionDatos['BTCUSDT_'].data));
			//console.log("px: " + px4 + ", qty: " + qty4 + ", amount: " + amount4);
			var qty5 = amount4 / binance.first(validacionDatos['BNBUSDT'].data);//lowestAsk;
			qty5 = Number(qty5.toFixed(3));	
			var px5 = binance.first(validacionDatos['BNBUSDT'].data);//lowestAsk;
			var amount5 = qty5 * px5 * (1 - 0.001 / 0.999);
			//console.log("px: " + px5 + ", qty: " + qty5 + ", amount: " + amount5);
			var qty6 = qty5 * (1 - 0.001 / 0.999);// * binance.first(validacionDatos['BNBBTC_'].data);
			qty6 = Number(qty6.toFixed(2));
			var px6 = binance.first(validacionDatos['BNBBTC_'].data);
			var amount6 = qty6 * px6 * (1 - 0.001 / 0.999);
			//console.log("px: " + px6 + ", qty: " + qty6 + ", amount: " + amount6);
			var result2 = amount6;
			//console.log(result2);
			result2 = result2 - qty4;
			//console.log("RES2: " + ((qty4) - amount6));
			
			if(result > 0.00001 && !order){
				order = {};
				console.log('\u0007');
				
				
				
				console.log('qty2: ' + qty2);
				binance.buy("BNBBTC", qty2, px2, {type:'LIMIT'}, (error, response) => {
				
					countOrd++;
					console.log("Limit Buy response", response);
					fsLauncher.appendFileSync('./bin2.txt',"Limit Buy response, " + JSON.stringify(response) + " \n", (err) => {
							if (err) throw err;
								////console.log('The "data to append" was appended to file!');
							});
					console.log("order id: " + response.orderId);
					if(error && error.body){
						console.log(error.body);
						order = null;
						fsLauncher.appendFileSync('./bin2.txt', 'BTCUSDT\n' + JSON.stringify(error.body) + " \n", (err) => {
							if (err) throw err;
								////console.log('The "data to append" was appended to file!');
							});  
					} else {
						order = response;
						if(order.status == 'FILLED'){
							console.log('qty1: ' + qty1);
							binance.buy("BTCUSDT", qty1, px1, {type:'LIMIT'}, (error, response) => {
								countOrd++;
							    console.log("Limit Buy response", response);
								fsLauncher.appendFileSync('./bin2.txt',"Limit Buy response, " + JSON.stringify(response) + " \n", (err) => {
									if (err) throw err;
										////console.log('The "data to append" was appended to file!');
									});
							    console.log("order id: " + response.orderId);
							    if(error && error.body){
									console.log(error.body);
									fsLauncher.appendFileSync('./bin2.txt', 'BNBBTC\n' + JSON.stringify(error.body) + " \n", (err) => {
										if (err) throw err;
											////console.log('The "data to append" was appended to file!');
									});  
							  }
							  
							  console.log("ORDER: " + countOrd);
							});
							
							console.log('qty3: ' + qty3);
							binance.sell("BNBUSDT", qty3, px3, {type:'LIMIT'}, (error, response) => {
								countOrd++;
							  console.log("Limit Buy response", response);
							  fsLauncher.appendFileSync('./bin2.txt',"Limit Buy response, " + JSON.stringify(response) + " \n", (err) => {
									if (err) throw err;
										////console.log('The "data to append" was appended to file!');
									});
							  console.log("order id: " + response.orderId);
							  if(error && error.body){
								console.log(error.body);
								fsLauncher.appendFileSync('./bin2.txt', 'BNBUSDT\n' + JSON.stringify(error.body) + " \n", (err) => {
										if (err) throw err;
											////console.log('The "data to append" was appended to file!');
										});  
							  }
							  
							  console.log("ORDER: " + countOrd);
							});
							
						} /*else {
							fnConsulta(qty1, px1, qty3, px3, "BTCUSDT", "BNBUSDT");
						}*/
					}
					
					
					
					
					
				  
					
					console.log("ORDER: " + countOrd);
				  
				
					
				  
				  
				});
				
				
			}
			
			
			if(result2 > 0.00001){
				
				console.log('\u0007');
				binance.buy("BNBUSDT", qty5, px5, {type:'LIMIT'}, (error, response) => {
					
				  countOrd++;
				  console.log("Limit Buy response", response);
				  fsLauncher.appendFileSync('./bin2.txt',"Limit Buy response, " + JSON.stringify(response) + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});
				  console.log("order id: " + response.orderId);
				  if(error && error.body){
					console.log(error.body);
					fsLauncher.appendFileSync('./bin2.txt', 'BNBUSDT\n' + JSON.stringify(error.body) + " \n", (err) => {
							if (err) throw err;
								////console.log('The "data to append" was appended to file!');
							});  
				  } else {
						order = response;
						if(order.status == 'FILLED'){
							binance.sell("BTCUSDT", qty4, px4, {type:'LIMIT'}, (error, response) => {
								fsLauncher.appendFileSync('./bin2.txt',"Limit Buy response, " + JSON.stringify(response) + " \n", (err) => {
									if (err) throw err;
										////console.log('The "data to append" was appended to file!');
									});
							  countOrd++;
							  console.log("Limit Buy response", response);
							  fsLauncher.appendFileSync('./bin2.txt',"Limit Buy response, " + JSON.stringify(response) + " \n", (err) => {
									if (err) throw err;
										////console.log('The "data to append" was appended to file!');
									});
							  console.log("order id: " + response.orderId);
							 if(error && error.body){
								console.log(error.body);
								fsLauncher.appendFileSync('./bin2.txt', 'BTCUSDT\n' + JSON.stringify(error.body) + " \n", (err) => {
										if (err) throw err;
											////console.log('The "data to append" was appended to file!');
										});  
							  }
							  
							  console.log("ORDER: " + countOrd);
							});
							
							
							binance.sell("BNBBTC", qty6, px6, {type:'LIMIT'}, (error, response) => {
								fsLauncher.appendFileSync('./bin2.txt',  JSON.stringify(response) + " \n", (err) => {
								if (err) throw err;
									////console.log('The "data to append" was appended to file!');
								}); 
							  countOrd++;	
							  console.log("Limit Buy response", response);
							  
							  fsLauncher.appendFileSync('./bin2.txt',"Limit Buy response, " + JSON.stringify(response) + " \n", (err) => {
									if (err) throw err;
										////console.log('The "data to append" was appended to file!');
									});
							  console.log("order id: " + response.orderId);
							  if(error && error.body){
								console.log(error.body);
								fsLauncher.appendFileSync('./bin2.txt', 'BNBBTC\n' + JSON.stringify(error.body) + " \n", (err) => {
										if (err) throw err;
											////console.log('The "data to append" was appended to file!');
										});  
							  }
							  
							  console.log("ORDER: " + countOrd);
							});
							
						} else {
							fnConsulta(qty4, px4, qty6, px6, "BTCUSDT", "BNBBTC");
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
				
				fsLauncher.appendFileSync('./bin2.txt', " [ " + (acum) + " :: " + (acum2) + " ]\n", (err) => {
							if (err) throw err;
								////console.log('The "data to append" was appended to file!');
							});
			}
			if(result < 0 && sw){
				//console.log("*********************************************");
				sw = false;
			}
			//console.log("[ " + result + " :: " + result2 + " ]");
			
		}
		
		
		
	} /*else {
		if(swOrd && order && order.orderId){
			
			console.log("******** consultando orden " + order.orderId + " ******* --> " + swOrd);
			fnConsulta();	
		}
		
	}*/
}


function fnConsulta(qty2, px2, qty3, px3, symbol1, symbol2, msg, result){
	
	if(order && order.orderId && swOrd == true){
		swOrd = false;
		binance.orderStatus(order.symbol, order.orderId, (error, orderStatus, symbol) => {
			console.log(symbol + " order status:", orderStatus);
			fsLauncher.appendFileSync('./bin2.txt', symbol + " order status: " + JSON.stringify(orderStatus) + " \n", (err) => {
					if (err) throw err;
						////console.log('The "data to append" was appended to file!');
					});  
				console.log("******** consultando orden " + order.orderId + " ******* --> " + swOrd);
			if(error && error.body){
				console.log(error.body);
				
				fsLauncher.appendFileSync('./bin2.txt', JSON.stringify(error.body) + " \n", (err) => {
					if (err) throw err;
						////console.log('The "data to append" was appended to file!');
					});  
				console.log("******** consultando orden " + order.orderId + " ******* --> " + swOrd);
				fnConsulta();
			}
			order = orderStatus;
			if(orderStatus.status == 'FILLED'){
				console.log('qty2: ' + qty2);
				binance.buy(symbol1, qty2, px2, {type:'LIMIT'}, (error, response) => {
					countOrd++;
				  console.log("Limit Buy response", response);
				  fsLauncher.appendFileSync('./bin2.txt',"Limit Buy response, " + JSON.stringify(response) + " \n", (err) => {
									if (err) throw err;
										////console.log('The "data to append" was appended to file!');
									});
				  console.log("order id: " + response.orderId);
				  if(error && error.body){
					console.log(error.body);
					fsLauncher.appendFileSync('./bin2.txt', 'BNBBTC\n' + JSON.stringify(error.body) + " \n", (err) => {
							if (err) throw err;
								////console.log('The "data to append" was appended to file!');
							});  
				  }
				  
				  console.log("ORDER: " + countOrd);
				});
				
				console.log('qty3: ' + qty3);
				binance.sell(symbol2, qty3, px3, {type:'LIMIT'}, (error, response) => {
					countOrd++;
				  console.log("Limit Buy response", response);
				  fsLauncher.appendFileSync('./bin2.txt',"Limit Buy response, " + JSON.stringify(response) + " \n", (err) => {
									if (err) throw err;
										////console.log('The "data to append" was appended to file!');
									});
				  console.log("order id: " + response.orderId);
				  if(error && error.body){
					console.log(error.body);
					fsLauncher.appendFileSync('./bin2.txt', 'BNBUSDT\n' + JSON.stringify(error.body) + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});  
				  }
				  
				  console.log("ORDER: " + countOrd);
				  
				});
			} else if(orderStatus.status == 'CANCELED'){
				order = null;	
				
			} else if(orderStatus.status == 'NEW'){
				if(result < 0){
					fnCancel(qty2, px2, qty3, px3, symbol1, symbol2, msg);
				}
			}
			console.log("******** Fin Consulta orden " + order.orderId + " ******* --> " + swOrd);
			swOrd = true;
		});	
	}
	
	
}


