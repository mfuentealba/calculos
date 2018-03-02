const poloniexOrd = require('poloniex-exchange-api');
var fsLauncher = require('fs');

const clientOrd = poloniexOrd.getClient({
    publicKey : 'WZG48KNT-L35B2XGQ-CDCU7AG1-DFG3NWC9', // Your public key
    privateKey: '966c91801fa03f37778de06e14b5fc6885a63f14220f446aaf698492df7da7b86556efe1751ce2083309348db66363664c2d22dbd82d664c7e6d6a74aa13677e', // Your private key
});


var order = null;

var EventEmitter = require('events').EventEmitter;
var ee = new EventEmitter();
ee.on("orderBook", fnLibros);
/*ee.on('orderBookRemove', orderBookRemove);
ee.on('orderBookModify', orderBookModify);*/
var salir = '';



var books = {};
var channelName = 'BTC_ETC';
books[channelName] = {};
var reg = 'ask';
var libro = 'asks';
var msg;
var contBooks = 0;
var opePeg = "asks";

var	volRef = 0;		
var volOP = 0;
		

const Poloniex = require('poloniex-api-node');
let poloniex = new Poloniex('WZG48KNT-L35B2XGQ-CDCU7AG1-DFG3NWC9', 
'966c91801fa03f37778de06e14b5fc6885a63f14220f446aaf698492df7da7b86556efe1751ce2083309348db66363664c2d22dbd82d664c7e6d6a74aa13677e');
const cluster = require('cluster');
var capital = 1;
var acum = 0;
poloniex.subscribe('ticker');
//poloniex.subscribe('BTC_ETC');
var objOperacion = {};
var swOperacion = false;
var swBLoqueo = false;




 
cluster.setupMaster({
				  exec: 'ordenes.js',    
				  args: [],
				  silent: false
			  });

var arrOrdenes = [];
var wk = cluster.fork();

wk.socket = this;
//objOperacion[wk.process.pid] = [str, data.currencyPair, 'USDT_' + ref];
arrOrdenes.push(wk);
wk.on('message', fnOrdenes);

wk = cluster.fork();

wk.socket = this;

arrOrdenes.push(wk);
wk.on('message', fnOrdenes);


wk = cluster.fork();

wk.socket = this;

arrOrdenes.push(wk);
wk.on('message', fnOrdenes);

				

var objCriptos = {};
var objRematablesUSDT = {ETC: 'ETC', XRP: 'XRP', ETH: 'ETH', LTC: 'LTC', BCH: 'BCH', STR: 'STR', XMR: 'XMR', ZEC: 'ZEC', NXT: 'NXT', DASH: 'DASH', REP: 'REP'};
poloniex.on('message', (channelName, data, seq) => {
  if (channelName === 'ticker') {
    objCriptos[data.currencyPair] = data;
	//console.log(swOperacion);
	if(swOperacion){
		
	} else if(data.currencyPair != 'USDT_BTC' && data.currencyPair != 'USDT_XMR' && data.currencyPair != 'USDT_ETH'){
		var monedas = data.currencyPair.split('_');
		//console.log(data);
		var change = 0;
		var obj = {};
		if(objRematablesUSDT[monedas[1]]){
			/*if(objCriptos('USDT_' + monedas[1])){
			obj['USDT_' + monedas[1]] = objCriptos('USDT_' + monedas[1]);
			change++;
			} */ 
			
			if(objCriptos['BTC_' + monedas[1]]){
				obj['BTC_' + monedas[1]] = objCriptos['BTC_' + monedas[1]];
				change++;
			}  
			
			if(objCriptos['XMR_' + monedas[1]]){
				obj['XMR_' + monedas[1]] = objCriptos['XMR_' + monedas[1]];
				change++;
			}
			
			if(objCriptos['ETH_' + monedas[1]]){
				obj['ETH_' + monedas[1]] = objCriptos['ETH_' + monedas[1]];
				change++;
			}
			
			if(change > 1){
				var res = {};
				var remate = objCriptos['USDT_' + monedas[1]];
				if(remate){
					var evalMejor;
					for(var str in obj){					
											
						var ref = str.split('_')[0];
						if(objCriptos['USDT_' + ref] && objCriptos[str]['lowestAsk'] && objCriptos['USDT_' + ref]['lowestAsk']){
							
							var precioTraspasando = (1 - 0.0015 / 0.9985) * remate['highestBid'] * (1 - 0.0025 / 0.9975);
							
							precioTraspasando = precioTraspasando.toFixed(8);
							var precioDirecto = objCriptos['USDT_' + ref]['lowestAsk'] * (1 + 0.0025 / 0.9975) * objCriptos[str]['lowestAsk'];
							
							precioDirecto = precioDirecto.toFixed(8);
							
							
							
							
							
							var gasto =  (1 / (objCriptos['USDT_' + ref]['lowestAsk'] * (1 + 0.0025 / 0.9975))) / (objCriptos[str]['lowestAsk'] * (1 + 0.0015 / 0.9985));
							gasto = gasto.toFixed(8);
							var retorno = gasto * remate['highestBid'] * (1 - 0.0025 / 0.9975);
							retorno = retorno.toFixed(8);
							//console.log(precioDirectoAlt + " - " + precioTraspasandoAlt);
							
							
							var evaluacion2 = retorno - gasto;
							
							volRef = 1 / objCriptos['USDT_' + ref]['lowestAsk'];
							volRef = volRef.toFixed(8);
							
							volOP = volRef * (1 - 0.0025 / 0.9975) / objCriptos[str]['lowestAsk'];
							volOP = volOP.toFixed(8);
							
							volRemate = volOP * (1 - 0.0015 / 0.9985) * remate['highestBid'] * (1 - 0.0025 / 0.9975);
							volRemate = volRemate.toFixed(8);
							
							
							//if(volRemate - 1 > 0){
								console.log("[ " + evaluacion2.toFixed(8) + " -------- " + (volRemate - 1) + " ] ----> " + str);
							//}
							//console.log(precioDirecto);
							if(volRemate - 1 > 0){// && (precioTraspasando - precioDirecto) * 100 / precioDirecto > 0.09
								if(!evalMejor){
									evalMejor = {gasto: 'USDT_' + ref, ope: str, ganancia: 'USDT_' + monedas[1], result: evaluacion2, m1: objCriptos['USDT_' + ref]['lowestAsk'], m2: objCriptos[str]['highestBid'], m3: remate['lowestAsk']};
								} else if(precioTraspasando - precioDirecto > evalMejor.result){
									evalMejor = {gasto: 'USDT_' + ref, ope: str, ganancia: 'USDT_' + monedas[1], result: evaluacion2};
								}
								
							}
											
						}
						
						
						/************************************************/
						//res[str] = {objCriptos[data.currencyPair].objCriptos['USDT_' + str]}
					}	
					if(evalMejor){
						console.log(evalMejor);
						msg = [];
						msg[0] = evalMejor.gasto;
						msg[1] = evalMejor.ope;
						msg[2] = evalMejor.ganancia;
						
						console.log(msg);
						
						poloniex.subscribe(msg[0]);
						poloniex.subscribe(msg[1]);
						poloniex.subscribe(msg[2]);
						poloniex.unsubscribe('ticker');		
						console.log("SUSCRITOS");	
						evalMejor = null;
						swOperacion = true;
						contBooks = 0;
					}						
				}	
			}
				
		}
	}
		
	  
} else {	   
	    
		var  i = 0;
		for(var obj of data){
			//console.log(obj.type);			
			//console.log(channelName);
			if((msg[0] == channelName || msg[1] == channelName || msg[2] == channelName) && swOperacion){
				ee.emit(obj.type, channelName, obj);	
				
			} else if(!swOperacion){
				poloniex.unsubscribe(msg[0]);
				poloniex.unsubscribe(msg[1]);
				poloniex.unsubscribe(msg[2]);
				objCriptos = {};
				poloniex.subscribe('ticker');	
				ee.removeListener('orderBookRemove', orderBookRemove);
				ee.removeListener('orderBookModify', orderBookModify);
				break;
			}
						
		}	   
	} 
});

function orderBookRemove(channelName, obj){
	//console.log(channelName);
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
		if(order){
			orderBookRemoveEjec(channelName, obj);
		}
	}
	
	//if(obj.data.type == 'bid'){
		//console.log(books[channelName][obj.data.type + 's']);
	//}
}

function orderBookRemoveEjec(channelName, obj){
	
	if(msg[1] == channelName){
		if(order.rate == obj.data.rate){
			console.log("CANCELACION");
			var objParam = {};
			objParam.opt = 'buy';
			console.log({currencyPair: msg[0], rate: precioReferencia, amount: volRef});
			objParam.data = {currencyPair: msg[0], rate: precioReferencia, amount: volRef};
			arrOrdenes[1].send(objParam);										
			console.log({currencyPair: msg[2], rate: precioTransada, amount: volRemate});
			objParam.opt = 'sell';
			objParam.data = {currencyPair: msg[2], rate: precioTransada, amount: volRemate};
			
			arrOrdenes[2].send(objParam);	
			swOperacion = false;
		}
	}
	fnDiferencia();
	
	
}



function orderBookModify(channelName, obj){
	//console.log(channelName + '  HHHHHHHHH  ' + obj.data.type + " ES IGUAL A " + msg[1] + " ? ");
	if(books[channelName]){
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
		
		var r = fnDiferencia();
		if(r > 0){
			//console.log('***SE EJECUTA***');
			//console.log(order);
			orderBookModifyEjec(channelName, obj);
		
		} 		
	}				
}

function orderBookModifyEjec(channelName, obj){
	if(msg[1] == channelName && order){
		
		if(order.rate == obj.data.rate){
			//console.log("CONSULTA ORDENES " + swBLoqueo);
			if(swBLoqueo == false){
				swBLoqueo = true;
				//console.log("CONSULTA ORDENES " + channelName);
				clientOrd.returnOpenOrders({currencyPair: channelName}).then(response => {
					const { status, data } = response;
					  
					//console.log(data);
					
					
					
					
					if(data.length == 0 && order){
						console.log("MODIFICACION");
						var objParam = {};
						objParam.opt = 'buy';
						console.log({currencyPair: msg[0], rate: precioReferencia, amount: volRef});
						objParam.data = {currencyPair: msg[0], rate: precioReferencia, amount: volRef};
						arrOrdenes[1].send(objParam);										
						console.log({currencyPair: msg[2], rate: precioTransada, amount: volRemate});
						objParam.opt = 'sell';
						objParam.data = {currencyPair: msg[2], rate: precioTransada, amount: volRemate};
						swOperacion = false;
						arrOrdenes[2].send(objParam);
						
						} else {
							swBLoqueo = false;	
						}
					  
				  
					  })
				.catch(err => {
				  //console.error(err);
				  swBLoqueo = false;
				});
			}
				
			
		} else if(order.rate < obj.data.rate){
			
			//console.log("CANCELANDO ORDEN " + swBLoqueo);
			if(swBLoqueo == false){
				//console.log("CANCELANDO ORDEN " + order.orderNumber + " PORQUE " + order.rate + " < " + obj.data.rate + " Y DIFERENCIA = " + fnDiferencia());
				swBLoqueo = true;
				fnCancelacion();
				
			}
			
		} 
		
	}
}



function fnSalir(){
	if(obj.data.type == 'bid'){
		console.log(obj);	
	}
	if(books[channelName] && books[channelName]["asks"] && books[channelName]["bids"]){
		
		for(let j = 0; j < books[channelName][obj.data.type + 's'].length; j++){
			let reg = books[channelName][obj.data.type + 's'][j];
			if(reg.rate == obj.data.rate){
				books[channelName][obj.data.type + 's'].splice(j, 1);
				console.log("ENCONTRADO EN " + j);
				break;
			} 
			
		}
		
		console.log("NO ENCONTRADO");
	}
	/*if(obj.data.type == 'bid'){
		console.log(books[channelName]["bids"]);
	}*/
}


function fnLibros(channelName, obj){
	console.log("******************* " + channelName + " **************************");
	var i = 0;
	var libro = "asks";
		

	books[channelName] = {};
	books[channelName]["asks"] = [];//obj.data.asks;
	books[channelName]["bids"] = [];//obj.data.bids;

	//console.log("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
	//console.log(books[channelName][libro]);
	for(let reg in obj.data[libro]){
		//books[channelName]["asks"][reg] = obj.data[libro][reg]
		books[channelName]["asks"].push({rate: reg, amount: obj.data[libro][reg]});
		//console.log('rate: ' + reg + ', amount: ' + obj.data[libro][reg]);
		if(i++ > 9){
			break;
		}
	}						

	i = 0;
	//console.log("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
	for(let reg in obj.data['bids']){
		//books[channelName]["asks"][reg] = obj.data[libro][reg]
		books[channelName]['bids'].push({rate: reg, amount: obj.data['bids'][reg]});
		//console.log('rate: ' + reg + ', amount: ' + obj.data['bids'][reg]);
		if(i++ > 10){
			break;
		}
	}

	contBooks++;
	if(contBooks == 3){
		
		fnDiferencia();
		ee.on('orderBookRemove', orderBookRemove);
		ee.on('orderBookModify', orderBookModify);
		


		//console.log("*******************************************************************************");	
		
		
		
	}
					
					
}

 
poloniex.on('open', () => {
  console.log(`Poloniex WebSocket connection open`);
});
 
poloniex.on('close', (reason, details) => {
  console.log(`Poloniex WebSocket connection disconnected`);
});
 
poloniex.on('error', (error) => {
  /*console.log(`An error has occured`);
  console.error(error);*/
});
 
poloniex.openWebSocket({ version: 2 });


var opeComisPeg = (1 + 0.0015 / 0.9985);
function fnDiferencia(){
	
	if(contBooks == 3){
		
		
		
		
			
		
		//console.log("PRECIO ANTERIOR: " + precioOperacion);
		if(order){
			precioOperacion = order.rate;
		} else {
			//precioOperacion = Number(books[msg[1]][opePeg][0].rate);
			precioOperacion = Number((books[msg[1]]['asks'][0].rate - books[msg[1]]['bids'][0].rate) / 2) + Number(books[msg[1]]['bids'][0].rate);
			precioOperacion = precioOperacion.toFixed(8);	
		}
		//console.log(precioOperacion);
		//console.log(reg);
		//console.log("NUEVO PRECIO: " + precioOperacion);
			
		
		
		
		
			
		
		precioTransada = books[msg[2]]["bids"][0].rate;
		
		
		precioReferencia = books[msg[0]]["asks"][0].rate;			
		
		
		
		
		volRef = 2 / precioReferencia;
		volRef = volRef.toFixed(8);
		
		volOP = volRef * (1 - 0.0025 / 0.9975) / precioOperacion;
		volOP = volOP.toFixed(8);
		
		volRemate = volOP * (1 - 0.0015 / 0.9985);
		volRemate = volRemate.toFixed(8);
		
		
		
		
		
		/*var gasto = (1 / (precioReferencia * (1 + 0.0025 / 0.9975))) / (precioOperacion * opeComisPeg);
		var retorno =  gasto * precioTransada * (1 - 0.0025 / 0.9975);
		*/
		
		var balance = (volRemate * (1 - 0.0025 / 0.9975) * precioTransada) - 2;
		
		//console.log("DIFERENCIA : " + (retorno - gasto));
		
		if(order){
			if(balance < 0){
				console.log("DIFERENCIA : " + (balance));
				fnCancelacion();
				swOperacion = false;				
			}			
			
		} else {
			if(balance > 0){
					fnEjecucion();
			}
			
		}
		
		return balance;// > 0 ? true : false;
	}
	console.log("AUN NO DESUBSCRIBO " + contBooks);
	return -1;
	
}

var countOrdenes = 0;
function fnOrdenes(msg){
	 
    switch(msg.cmd){
        case 'fin proceso':
			countOrdenes++;
			if(countOrdenes == 2){
				swOperacion = false;
				
				countOrdenes = 0;
				order = null;
			}
			
        break;
        default:
			/*var obj = {};
			obj.opt = 'sell';
			obj.data = {currencyPair: 'USDT_BTC', rate: 15000, amount: 0.001};
			this.send(obj);*/
        break;
    }
	
}

function fnCancelacion(){
	swBLoqueo = true;
	clientOrd.cancelOrder({orderNumber:order.orderNumber}).then(response => {
	  const { status, data } = response;
	  console.log(data);
	  //process.send({ cmd: 'fin proceso', capital: capital });
	  if(data.success == 0){
			if(data.error == 'Invalid order number, or you are not the person who placed the order.'){
				var objParam = {};
				objParam.opt = 'buy';
				console.log({currencyPair: msg[0], rate: precioReferencia, amount: volRef});
				objParam.data = {currencyPair: msg[0], rate: precioReferencia, amount: volRef};
				arrOrdenes[1].send(objParam);										
				console.log({currencyPair: msg[2], rate: precioTransada, amount: volRemate});
				objParam.opt = 'sell';
				objParam.data = {currencyPair: msg[2], rate: precioTransada, amount: volRemate};
				swOperacion = false;
				arrOrdenes[2].send(objParam);
			}
	  }
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

function fnEjecucion(){
	if(swBLoqueo == false && order == null){
		console.log("PETICION DE ORDEN");
		swBLoqueo = true;
		//capital = capital * ((retorno - gasto) * 100 / gasto);
								
		
		//console.log({currencyPair: msg[2], rate: precioTransada, amount: volRemate});	
		fsLauncher.appendFileSync('./' + msg[1] + '.txt', "{currencyPair: " + msg[1] + ", rate: " + precioOperacion + ", amount: " + volOP + "}\n", (err) => {
			if (err) throw err;
				////console.log('The "data to append" was appended to file!');
			});
		var precOper = ((Number(books[msg[1]]['asks'][0].rate) - Number(books[msg[1]]['bids'][0].rate)) / 2) + Number(books[msg[1]]['bids'][0].rate);
		clientOrd.buy({currencyPair: msg[1], rate: precOper, amount: volOP})
			  .then(response => {
				  
				  const { status, data } = response;
				  console.log(data);
				  
				  if(data.error){
					console.log("\n\n\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
					console.log("**** __ CANCELADA (fnEjecucion)__****");
					console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\n\n");
					swBLoqueo = false;
				  } else if(data.resultingTrades.length > 0){					
				    console.log("EJECUCION");
					 console.log({currencyPair: msg[0], rate: precioReferencia, amount: volRef})
					var objParam = {};
					objParam.data = {currencyPair: msg[0], rate: precioReferencia, amount: volRef};															
					arrOrdenes[1].send(objParam);										
					 console.log({currencyPair: msg[2], rate: precioTransada, amount: volRemate})
					objParam.opt = 'sell';
					objParam.data = {currencyPair: msg[2], rate: precioTransada, amount: volRemate};
					arrOrdenes[2].send(objParam);
					swOperacion = false;					
					 
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
				
			
	}
							
	
}
