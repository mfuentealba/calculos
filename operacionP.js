var fsLauncher = require('fs');
const poloniexOrd = require('poloniex-exchange-api');

const clientOrd = poloniexOrd.getClient({
    publicKey : 'WZG48KNT-L35B2XGQ-CDCU7AG1-DFG3NWC9', // Your public key
    privateKey: '966c91801fa03f37778de06e14b5fc6885a63f14220f446aaf698492df7da7b86556efe1751ce2083309348db66363664c2d22dbd82d664c7e6d6a74aa13677e', // Your private key
});

var order = null;




var EventEmitter = require('events').EventEmitter;
var ee = new EventEmitter();
ee.on("orderBook", fnLibros);
ee.on('orderBookRemoveSalir', fnSalir);
ee.on('orderBookModifySalir', fnSalir);
var salir = '';

/*
clientOrd.sell({currencyPair: 'USDT_BTC', rate: 15000, amount: 0.001, nonce: 9196535984736059393})
      .then(response => {
          const { status, data } = response;
		  console.log(data);
		  
		  
      })
      .catch(err => console.error(err));
*/





var operacion;
var volOperacion;
var volTransada;
var precioTransada = 0.0;
var precioOperacion = 0.0;
var volReferencia;
var precioReferencia = 0.0;
var books = {};
var ganancia = 0;
var msg;
var opePeg;
var opeComisPeg;
var fillOrKill;
var tick;
var retorno;
var gasto;
var capital;
var swBLoqueo = false;

const cluster = require('cluster');
const Poloniex = require('poloniex-api-node');
let poloniex = new Poloniex('Z3QXH3L0-AR8VP0ZA-PTR8VH8C-PBQO5LQU', '23b36c259b7a1af19dbf3b4bd444fd19e182637abd14fb62d1d784a711898939295b2fd96665a586c0d604f3296ba74731c029cddc6fb6d73b76a2b9f8744194');


cluster.setupMaster({
				  exec: 'ordenes.js',    
				  args: [],
				  silent: false
			  });

var arrOrdenes = [];
var wk = cluster.fork();


var contBooks = 0;
process.on('message', (msgReq) => {
	
	//console.log(msg);
	capital = msgReq.capital;
	msg = msgReq.data;
	if(msgReq.opt == 'SEGURO'){
		opePeg = 'asks';
		opeComisPeg = (1 - 0.0025 / 0.9975);
		fillOrKill = 1;
		tick = 0;
	} else {
		opePeg = 'bids';
		opeComisPeg = (1 - 0.0015 / 0.9985);
		fillOrKill = 0;
		tick = 0.00000001;
	}
	
	poloniex.subscribe(msg[0]);
	poloniex.subscribe(msg[1]);
	poloniex.subscribe(msg[2]);
	
	poloniex.on('message', (channelName, data, seq) => {	 
		
		//console.log(data);
		//console.log("*******************************************************************************");	


		



		
		for(var obj of data){
			ee.emit(obj.type + salir, channelName, obj);
			
		}
		
			
		
	});
	 
	poloniex.on('open', () => {
	  console.log(`Poloniex WebSocket connection open`);
	});
	 
	poloniex.on('close', (reason, details) => {
	  console.log(`Poloniex WebSocket connection disconnected`);
	});
	 
	poloniex.on('error', (error) => {
	  console.log(`An error has occured`);
	});
	 
	poloniex.openWebSocket({ version: 2 });
		
	
	
	
	
		
});



function orderBookModify(channelName, obj){
	//console.log(data);
	/*if(books[channelName]){
		books[channelName][obj.data.type + 's'][obj.data.rate] = obj.data.amount;
	}*/
	
	
	
	//if(obj.data.type == 'bid'){
		//console.log(obj);	
	//}
	
	/*console.log(obj.data.type + 's');
	console.log(books[channelName]);
	console.log(books[channelName][obj.data.type + 's']);
	console.log(books[channelName][obj.data.type + 's'].length - 1);
	console.log(books[channelName][obj.data.type + 's'][books[channelName][obj.data.type + 's'].length - 1]);
	console.log(books[channelName][obj.data.type + 's'][books[channelName][obj.data.type + 's'].length - 1].rate);
	*/
	if(obj.data.type == 'ask'){
		if(obj.data.rate == books[channelName][obj.data.type + 's'][0].rate){
			//console.log("ES IGUAL AL [0]");
			books[channelName][obj.data.type + 's'][0].amount = obj.data.amount;
			
		} else if(obj.data.rate < books[channelName][obj.data.type + 's'][0].rate){
			//console.log("ES MENOR");
			books[channelName][obj.data.type + 's'].unshift({rate: obj.data.rate, amount: obj.data.amount});
			
		} else if(obj.data.rate > books[channelName][obj.data.type + 's'][0].rate && obj.data.rate < books[channelName][obj.data.type + 's'][books[channelName][obj.data.type + 's'].length - 1].rate){
			//console.log("ESTA EN EL LIBRO");
			//console.log(books[channelName][obj.data.type + 's'].length);
			for(let j = 0; j < books[channelName][obj.data.type + 's'].length; j++){
				let reg = books[channelName][obj.data.type + 's'][j];
				if(reg.rate == obj.data.rate){
					//console.log("ENCONTRADO EN " + j);
					reg.amount = obj.data.amount;
					break;
				} else if(reg.rate > obj.data.rate){
					//console.log(reg.rate + " > " + obj.data.rate);
					//console.log(books[channelName][obj.data.type + 's']);
					books[channelName][obj.data.type + 's'].splice(j, 0, {rate: obj.data.rate, amount: obj.data.amount});
					break;
				}
				
			}
			//console.log("SALI");
		} else {
			//console.log("MAYOR AL LIBRO");
			books[channelName][obj.data.type + 's'].push({rate: obj.data.rate, amount: obj.data.amount});
			
		}	
	} else {
		if(obj.data.rate == books[channelName][obj.data.type + 's'][0].rate){
			//console.log("ES IGUAL AL [0]");
			books[channelName][obj.data.type + 's'][0].amount = obj.data.amount;
			
		} else if(obj.data.rate > books[channelName][obj.data.type + 's'][0].rate){
			//console.log("ES MAYOR");
			books[channelName][obj.data.type + 's'].unshift({rate: obj.data.rate, amount: obj.data.amount});
			
		} else if(obj.data.rate < books[channelName][obj.data.type + 's'][0].rate && obj.data.rate > books[channelName][obj.data.type + 's'][books[channelName][obj.data.type + 's'].length - 1].rate){
			//console.log("ESTA EN EL LIBRO");
			//console.log(books[channelName][obj.data.type + 's'].length);
			for(let j = 0; j < books[channelName][obj.data.type + 's'].length; j++){
				let reg = books[channelName][obj.data.type + 's'][j];
				if(reg.rate == obj.data.rate){
					//console.log("ENCONTRADO EN " + j);
					reg.amount = obj.data.amount;
					break;
				} else if(reg.rate < obj.data.rate){
					//console.log(reg.rate + " < " + obj.data.rate);
					//console.log(books[channelName][obj.data.type + 's']);
					books[channelName][obj.data.type + 's'].splice(j, 0, {rate: obj.data.rate, amount: obj.data.amount});
					break;
				}
				
			}
			//console.log("SALI");
		} else {
			//console.log("MAYOR AL LIBRO");
			books[channelName][obj.data.type + 's'].push({rate: obj.data.rate, amount: obj.data.amount});
			
		}	
	}
	
	
	
	//if(obj.data.type == 'bid'){
		//console.log(books[channelName][obj.data.type + 's']);
	//}
	
	
	
	
	
	
	if(order && msg[1] == channelName){
		if(order.rate == obj.data.rate){
			if(swBLoqueo == false){
				swBLoqueo = true;
				console.log("CONSULTA ORDENES " + channelName);
				clientOrd.returnOpenOrders({currencyPair: channelName}).then(response => {
					const { status, data } = response;
					  
					console.log(data);
					swBLoqueo = false;
					var volRef = 1 / precioReferencia;
					volRef = volRef.toFixed(8);
					//console.log({currencyPair: msg[0], rate: precioReferencia, amount: volRef});
					var volOP = volRef * (1 - 0.0025 / 0.9975) / precioOperacion;
					volOP = volOP.toFixed(8);
					console.log({currencyPair: msg[1], rate: precioOperacion, amount: volOP});	
					volRemate = volOP * (1 - 0.0025 / 0.9975) * precioTransada;
					volRemate = volRemate.toFixed(8);
					
					
					if(data.length == 0 && order){
						clientOrd.buy({currencyPair: msg[0], rate: precioReferencia, amount: volRef})
								  .then(response => {
									  const { status, data } = response;
									  console.log(data);
									  
										
										clientOrd.sell({currencyPair: msg[2], rate: precioTransada, amount: volRemate})
										  .then(response => {
											  const { status, data } = response;
											  console.log(data);
											  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "orderBookModify\n\n\n\n\n", (err) => {
												if (err) throw err;
													////console.log('The "data to append" was appended to file!');
												});	
											  process.send({ cmd: 'fin proceso', capital: capital });
											  process.exit();
											  
										  })
										  .catch(err => console.error(err));
									  
								  })
								  .catch(err => console.error(err));  
						}
					  
				  
					  })
					  .catch(err => {
						  //console.error(err);
						  swBLoqueo = false;
						  });
				}
				
			
		} else if(order.rate < obj.data.rate || fnDiferencia() < 0){
			
			
			if(swBLoqueo == false){
				console.log("CANCELANDO ORDEN " + order.orderNumber + " PORQUE " + order.rate + " < " + obj.data.rate + " Y DIFERENCIA = " + fnDiferencia());
				swBLoqueo = true;
				fnCancelacion();
				
			}
			
		} 
	} else {
		var r = fnDiferencia();
		if(r > 0){
			//console.log(order);
			fnEjecucion();
			//exit;
		} else {
			salir = 'Salir';
			if(order){
				console.log("CANCELAR ORDEN Y SALIR");	
				fnCancelacion();
					
			} else {
				console.log("DIFERENCIA PERDIDA (SIN ORDEN): " + r);
			fsLauncher.appendFileSync('./' + msg[1] + '.txt', "orderBookModify DIFERENCIA PERDIDA (SIN ORDEN): " + r + "\n\n\n\n\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});				
				process.send({ cmd: 'fin proceso', capital: capital });
				process.exit();	
			}
			
			
			
		}
	}
	
}	
	
function fnSalir(){
	if(!order){
		fsLauncher.appendFileSync('./' + msg[1] + '.txt', "fnSalir\n\n\n\n\n", (err) => {
			if (err) throw err;
				////console.log('The "data to append" was appended to file!');
			});	
		process.send({ cmd: 'fin proceso', capital: capital });
		process.exit();		
	}
	
}
	
function orderBookRemove(channelName, obj){
	//.log(data);
	/*if(books[channelName]){
		delete books[channelName][obj.data.type + 's'][obj.data.rate];	
	}*/
	//console.log(obj);
	if(books[channelName] && books[channelName]["asks"] && books[channelName]["bids"]){
						
		for(let j = 0; j < books[channelName][obj.data.type + 's'].length; j++){
			let reg = books[channelName][obj.data.type + 's'][j];
			if(reg.rate == obj.data.rate){
				books[channelName][obj.data.type + 's'].splice(j, 1);
				//console.log("ENCONTRADO EN " + j);
				break;
			} 
			
		}
		
		//console.log("NO ENCONTRADO");
	}
	
	//if(obj.data.type == 'bid'){
		//console.log(books[channelName][obj.data.type + 's']);
	//}
	
	
	
	
	
	if(order && msg[1] == channelName){
		if(order.rate == obj.data.rate){
			var volRef = 1 / precioReferencia;
			volRef = volRef.toFixed(8);
			//console.log({currencyPair: msg[0], rate: precioReferencia, amount: volRef});
			var volOP = volRef * (1 - 0.0025 / 0.9975) / precioOperacion;
			volOP = volOP.toFixed(8);
			console.log({currencyPair: msg[1], rate: precioOperacion, amount: volOP});	
			volRemate = volOP * (1 - 0.0025 / 0.9975) * precioTransada;
			volRemate = volRemate.toFixed(8);
			clientOrd.buy({currencyPair: msg[0], rate: precioReferencia, amount: volRef})
						  .then(response => {
							    const { status, data } = response;
							    console.log(data);
							  
								
								clientOrd.sell({currencyPair: msg[2], rate: precioTransada, amount: volRemate})
								  .then(response => {
									  const { status, data } = response;
									  console.log(data);
									  process.send({ cmd: 'fin proceso', capital: capital });
									  process.exit();
									  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "orderBookRemove\n\n\n\n\n", (err) => {
										if (err) throw err;
											////console.log('The "data to append" was appended to file!');
										});	
									  
								  })
								  .catch(err => console.error(err));
							  
						  })
						  .catch(err => console.error(err));  							
		}
	}
	if(order && fnDiferencia() < 0){
		
		if(swBLoqueo == false){
			console.log("CANCELANDO ORDEN " + order.orderNumber + " PORQUE  DIFERENCIA = " + fnDiferencia());
			fsLauncher.appendFileSync('./' + msg[1] + '.txt', "CANCELANDO ORDEN " + order.orderNumber + " PORQUE  DIFERENCIA = " + fnDiferencia()+ "\n", (err) => {
			if (err) throw err;
				////console.log('The "data to append" was appended to file!');
			});
			swBLoqueo = true;
			fnCancelacion();
			
		}
		
	}


}


function fnLibros(channelName, obj){
	/*books[channelName] = {};
	books[channelName]["asks"] = obj.data.asks;
	books[channelName]["bids"] = obj.data.bids;*/
	console.log("********************************* " + channelName + " **********************************************");
	var i = 0;
	var libro;
	if(channelName == msg[0]){
		libro = "asks";
	} else if(channelName == msg[1]){
		
		libro = opePeg;
	} else {
		libro = "bids";
	}
	/*for(let reg in books[channelName][libro]){
		console.log('rate: ' + reg + ', vol: ' + books[channelName][libro][reg]);
		if(i++ > 10){
			break;
		}
	}*/
	
	
	
	books[channelName] = {};
	books[channelName]["asks"] = [];//obj.data.asks;
	books[channelName]["bids"] = [];//obj.data.bids;
	
	console.log("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
	console.log(books[channelName][libro]);
	for(let reg in obj.data[libro]){
		//books[channelName]["asks"][reg] = obj.data[libro][reg]
		books[channelName]["asks"].push({rate: reg, amount: obj.data[libro][reg]});
		console.log('rate: ' + reg + ', amount: ' + obj.data[libro][reg]);
		if(i++ > 9){
			break;
		}
	}						
	
	i = 0;
	console.log("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
	for(let reg in obj.data['bids']){
		//books[channelName]["asks"][reg] = obj.data[libro][reg]
		books[channelName]['bids'].push({rate: reg, amount: obj.data['bids'][reg]});
		console.log('rate: ' + reg + ', amount: ' + obj.data['bids'][reg]);
		if(i++ > 10){
			break;
		}
	}
	
	contBooks++;
	if(contBooks == 3){
		var r = fnDiferencia();
		if(r > 0){
			
			/***************************** TEST 1 USD **************************************/

			if(swBLoqueo == false && order == null){
				console.log("PETICION DE ORDEN");
				swBLoqueo = true;
				capital = capital * ((retorno - gasto) * 100 / gasto);
										
				var volRef = 2 / precioReferencia;
				volRef = volRef.toFixed(8);
				//console.log({currencyPair: msg[0], rate: precioReferencia, amount: volRef});
				var volOP = volRef * (1 - 0.0025 / 0.9975) / precioOperacion;
				volOP = volOP.toFixed(8);
				console.log({currencyPair: msg[1], rate: precioOperacion, amount: volOP});	
				volRemate = volOP * (1 - 0.0025 / 0.9975) * precioTransada;
				volRemate = volRemate.toFixed(8);
				//console.log({currencyPair: msg[2], rate: precioTransada, amount: volRemate});	
				
				clientOrd.buy({currencyPair: msg[1], rate: precioOperacion, amount: volOP, fillOrKill: fillOrKill})
					  .then(response => {
						  
						  const { status, data } = response;
						  console.log(data);
						  
						  if(data.error){
							console.log("\n\n\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
							console.log("**** __ CANCELADA __****");
							console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\n\n");
							swBLoqueo = false;
						  } else if(data.resultingTrades.length > 0){
							clientOrd.buy({currencyPair: msg[0], rate: precioReferencia, amount: volRef})
							  .then(response => {
								  const { status, data } = response;
								  console.log(data);
								  
									
									clientOrd.sell({currencyPair: msg[2], rate: precioTransada, amount: volRemate})
									  .then(response => {
										  const { status, data } = response;
										  console.log(data);
										  fsLauncher.appendFileSync('./' + msg[1] + '.txt',  'fin proceso' + "\n", (err) => {
											if (err) throw err;
												////console.log('The "data to append" was appended to file!');
											});
										  process.send({ cmd: 'fin proceso', capital: capital });
										  process.exit();
										  
									  })
									  .catch(err => {
										  console.error(err);
										  console.log("NO SE PUDO CREAR ORDEN: " + msg[2]);
										  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "NO SE PUDO CREAR ORDEN: " + msg[2] + "\n", (err) => {
											if (err) throw err;
												////console.log('The "data to append" was appended to file!');
											});
									});
								  
							  })
							  .catch(err => {
								  console.error(err);
								  console.log("NO SE PUDO CREAR ORDEN: " + msg[0]);
								  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "NO SE PUDO CREAR ORDEN: " + msg[0] + "\n", (err) => {
									if (err) throw err;
										////console.log('The "data to append" was appended to file!');
									});
							  });  
						  } else {
							//clientOrd.cancelOrder(data.orderNumber);
							console.log("NUEVA ORDEN: " + data.orderNumber);
							order = {};
							order.orderNumber = data.orderNumber;
							
							order.rate = precioOperacion;				
							swBLoqueo = false;
							ee.on('orderBookRemove', orderBookRemove);
							ee.on('orderBookModify', orderBookModify);
						  }
							
							
						  
						  
					  })
					  .catch(err => {
						  console.error(err)
						  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "fnLibros\n\n\n\n\n", (err) => {
										if (err) throw err;
											////console.log('The "data to append" was appended to file!');
										});	
						  process.send({ cmd: 'fin proceso', capital: capital });
						  
						  process.exit();
						  
						 });							
														
				/*poloniex.unsubscribe(msg[0]);
				poloniex.unsubscribe(msg[1]);
				poloniex.unsubscribe(msg[2]);*/
				//process.exit();
				/*if(volOperacion * precioOperacion < volReferencia){//Puedo operar todo
					if(volOperacion < volTransada){ //Puedo vender Todo
						console.log("OPERACION EXITOSA 1");
						
						console.log("RESULTADO: " + ((retorno - gasto) * volOperacion));
					} else {
						console.log("OPERACION EXITOSA 2");
						
						console.log("RESULTADO: " + ((retorno - gasto) * volTransada / precioTransada ));
					}
				} else {
					
					if(volOperacion < volTransada){ //Puedo vender Todo
						console.log("OPERACION EXITOSA 3");
						
						console.log("RESULTADO: " + ((retorno - gasto) * volReferencia / precioOperacion ));
					} else {
						console.log("OPERACION EXITOSA 4");
						
						console.log("RESULTADO: " + ((retorno - gasto) * volTransada / precioTransada ));
					}
				}*/
			
			}
			
			
		} else {
			console.log("DIFERENCIA PERDIDA: " + r);	
			salir = "Salir";
			fsLauncher.appendFileSync('./' + msg[1] + '.txt', "DIFERENCIA PERDIDA: " + r + "\n", (err) => {
					if (err) throw err;
						////console.log('The "data to append" was appended to file!');
					});
			if(order){
				console.log("CANCELAR ORDEN Y SALIR");	
				fnCancelacion();
				
			} else {
				console.log("SIN ORDEN");	
				fsLauncher.appendFileSync('./' + msg[1] + '.txt', "SIN ORDEN\n\n\n\n\n", (err) => {
										if (err) throw err;
											////console.log('The "data to append" was appended to file!');
										});	
				process.send({ cmd: 'fin proceso', capital: capital });
				process.exit();	
			}
			
			
		}
		
		
		console.log("*******************************************************************************");	
		
		
		
	}
	
	
	
}


function fnEjecucion(){
	if(swBLoqueo == false && order == null){
		console.log("PETICION DE ORDEN");
		swBLoqueo = true;
		capital = capital * ((retorno - gasto) * 100 / gasto);
								
		var volRef = 2 / precioReferencia;
		volRef = volRef.toFixed(8);
		//console.log({currencyPair: msg[0], rate: precioReferencia, amount: volRef});
		var volOP = volRef * (1 - 0.0025 / 0.9975) / precioOperacion;
		volOP = volOP.toFixed(8);
		console.log({currencyPair: msg[1], rate: precioOperacion, amount: volOP});	
		volRemate = volOP * (1 - 0.0025 / 0.9975) * precioTransada;
		volRemate = volRemate.toFixed(8);
		//console.log({currencyPair: msg[2], rate: precioTransada, amount: volRemate});	
		fsLauncher.appendFileSync('./' + msg[1] + '.txt', "{currencyPair: " + msg[1] + ", rate: " + precioOperacion + ", amount: " + volOP + "}\n", (err) => {
			if (err) throw err;
				////console.log('The "data to append" was appended to file!');
			});
		clientOrd.buy({currencyPair: msg[1], rate: precioOperacion, amount: volOP, fillOrKill: fillOrKill})
			  .then(response => {
				  
				  const { status, data } = response;
				  console.log(data);
				  
				  if(data.error){
					console.log("\n\n\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
					console.log("**** __ CANCELADA __****");
					console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\n\n");
					swBLoqueo = false;
				  } else if(data.resultingTrades.length > 0){
					 fnGasto({currencyPair: msg[0], rate: precioReferencia, amount: volRef}, {currencyPair: msg[2], rate: precioTransada, amount: volRemate});
				  } else {
					//clientOrd.cancelOrder(data.orderNumber);
					console.log("NUEVA ORDEN: " + data.orderNumber);
					fsLauncher.appendFileSync('./' + msg[1] + '.txt', "NUEVA ORDEN: " + data.orderNumber + "\n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});
					
					order = {};
					order.orderNumber = data.orderNumber;
					
					order.rate = precioOperacion;				
					swBLoqueo = false;
				  }
					
					
				  
				  
			  })
			  .catch(err => {
				  console.error(err);
				  console.log("NO SE PUDO CREAR ORDEN: " + msg[1]);
				  swBLoqueo = false;
				  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "NO SE PUDO CREAR ORDEN: " + msg[1] + "\n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});
					});							
														
				/*poloniex.unsubscribe(msg[0]);
				poloniex.unsubscribe(msg[1]);
				poloniex.unsubscribe(msg[2]);*/
				//process.exit();
				/*if(volOperacion * precioOperacion < volReferencia){//Puedo operar todo
					if(volOperacion < volTransada){ //Puedo vender Todo
						console.log("OPERACION EXITOSA 1");
						
						console.log("RESULTADO: " + ((retorno - gasto) * volOperacion));
					} else {
						console.log("OPERACION EXITOSA 2");
						
						console.log("RESULTADO: " + ((retorno - gasto) * volTransada / precioTransada ));
					}
				} else {
					
					if(volOperacion < volTransada){ //Puedo vender Todo
						console.log("OPERACION EXITOSA 3");
						
						console.log("RESULTADO: " + ((retorno - gasto) * volReferencia / precioOperacion ));
					} else {
						console.log("OPERACION EXITOSA 4");
						
						console.log("RESULTADO: " + ((retorno - gasto) * volTransada / precioTransada ));
					}
				}*/
			
	}
							
	
}


function fnGasto(obj1, obj2){
	clientOrd.buy(obj1)
	  .then(response => {
		const { status, data } = response;
		console.log(data);
		fsLauncher.appendFileSync('./' + msg[1] + '.txt', JSON.stringify({currencyPair: msg[0], rate: precioReferencia, amount: volRef}) + "}\n", (err) => {
		if (err) throw err;
			////console.log('The "data to append" was appended to file!');
		});
		fnRemate(obj2);
		fsLauncher.appendFileSync('./' + msg[1] + '.txt', JSON.stringify(data) + "\n", (err) => {
		if (err) throw err;
			////console.log('The "data to append" was appended to file!');
		});
			
			
			  
		  
	  })
	  .catch(err => {
		  console.error(err);
		  console.log("NO SE PUDO CREAR ORDEN: " + msg[0]);
		  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "NO SE PUDO CREAR ORDEN: " + msg[0] + "\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
		fnGasto(obj1, obj2);

	  }); 
}

function fnRemate(obj2){
	clientOrd.sell()
		  .then(response => {
			  const { status, data } = response;
			  console.log(data);
			  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "{currencyPair: " + msg[2] + ", rate: " + precioTransada + ", amount: " + volRemate + "}\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
				fsLauncher.appendFileSync('./' + msg[1] + '.txt', JSON.stringify(data) + "\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
			  //swBLoqueo = false;
			  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "fnRemate\n\n\n\n\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
			  process.send({ cmd: 'fin proceso', capital: capital });
			  process.exit();
			  
		  })
		  .catch(err => {
			  console.error(err);
			  console.log("NO SE PUDO CREAR ORDEN: " + msg[2]);
			  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "NO SE PUDO CREAR ORDEN: " + msg[2] + "\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
				fnRemate(obj2);
		});
}


function fnCancelacion(){
	clientOrd.cancelOrder({orderNumber:order.orderNumber}).then(response => {
	  const { status, data } = response;
	  console.log(data);
	  //process.send({ cmd: 'fin proceso', capital: capital });
	  
	  console.log("CANCELACION EXITOSA");
	  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "CANCELACION EXITOSA de " + order.orderNumber + "\n", (err) => {
			if (err) throw err;
				////console.log('The "data to append" was appended to file!');
			});
	  swBLoqueo = false;
	  order = null;
	  if(salir == 'Salir'){
		  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "fnCancelacion\n\n\n\n\n", (err) => {
			if (err) throw err;
				////console.log('The "data to append" was appended to file!');
			});
		process.send({ cmd: 'fin proceso', capital: capital });
		process.exit();	
	  }
	})
	.catch(err => {
		console.error(err);
		console.log("ERROR CANCELACION");
		fsLauncher.appendFileSync('./' + msg[1] + '.txt', "ERROR CANCELACION\n", (err) => {
			if (err) throw err;
				////console.log('The "data to append" was appended to file!');
			});
		fnCancelacion()
	});
}


function fnDiferencia(){
	
	
	
	for(let reg of books[msg[0]]["asks"]){
		volReferencia = reg.amount;
		precioReferencia = reg.rate;
		break;
	}
	
	for(let reg of books[msg[1]][opePeg]){
		
		volOperacion = reg.amount;
		//console.log("PRECIO ANTERIOR: " + precioOperacion);
		precioOperacion = Number(reg.rate) + tick;
		precioOperacion = precioOperacion.toFixed(8);
		//console.log(reg);
		//console.log("NUEVO PRECIO: " + precioOperacion);
		if(order){
			order.rate = precioOperacion;
			//console.log(books[msg[1]][opePeg]);			
		}
		
		break;
	}
	
	
	for(let reg of books[msg[2]]["bids"]){
		
		volTransada = reg.amount;
		precioTransada = reg.rate;
		break;
	}
	
	
	
	var retorno = opeComisPeg * precioTransada * (1 - 0.0025 / 0.9975);
	//console.log("Transada:  " + precioTransada);
	//console.log("RETORNO:   " + retorno);	
	var gasto = precioReferencia * (1 + 0.0025 / 0.9975) * precioOperacion;
	//console.log("Referencia:" + precioReferencia);
	//console.log("Operacion: " + precioOperacion);
	//console.log("GASTO:     " + gasto);	
	
	
	
	
	//console.log("DIFERENCIA : " + (retorno - gasto));
	return retorno - gasto;// > 0 ? true : false;
}


process.send({ cmd: process.pid });