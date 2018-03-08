const poloniexOrd = require('poloniex-exchange-api');
var fsLauncher = require('fs');

const clientOrd = poloniexOrd.getClient({
    publicKey : '0NP8Y42K-0OIG2UWY-Z3XYC9J8-YD716RQX', // Your public key
    privateKey: '0e51040bbd62bb0b6b733424224a732bb21b4e2f89a6d41d95aab0b5e1bb032f1cf14fb3b2931da0e8932f9340149d1ca20280e2bc63e4679bef407f05d6ad60', // Your private key
});

var objCancel = {};

var order = null;

var EventEmitter = require('events').EventEmitter;
var ee = new EventEmitter();
ee.on("orderBook", fnLibros);

var salir = '';


var myVar;


function myFunction() {
    myVar = setTimeout(fnConsultaOrdenes, 3000);
}

function myStopFunction() {
    clearTimeout(myVar);

}

var books = {};
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
	/*fsLauncher.appendFileSync('./ticker.txt', JSON.stringify(data) + "\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});*/
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
							
							var precioTraspasando = (1 - 0.0025 / 0.9975) * remate['highestBid'] * (1 - 0.0025 / 0.9975);
							
							precioTraspasando = precioTraspasando.toFixed(8);
							var precioDirecto = objCriptos['USDT_' + ref]['lowestAsk'] * (1 + 0.0025 / 0.9975) * objCriptos[str]['highestBid'];//(((objCriptos[str]['lowestAsk'] - objCriptos[str]['highestBid']) / 2) + objCriptos[str]['highestBid']);
							
							precioDirecto = precioDirecto.toFixed(8);
							
							
							
							
							
							var gasto =  (1 / (objCriptos['USDT_' + ref]['lowestAsk'] * (1 + 0.0025 / 0.9975))) / (objCriptos[str]['lowestAsk'] * (1 + 0.0015 / 0.9985));
							gasto = gasto.toFixed(8);
							var retorno = gasto * remate['highestBid'] * (1 - 0.0025 / 0.9975);
							retorno = retorno.toFixed(8);
							//console.log(precioDirectoAlt + " - " + precioTraspasandoAlt);
							
							
							
							
							volRef = 1 / objCriptos['USDT_' + ref]['lowestAsk'];
							volRef = volRef.toFixed(8);
							
							volOP = volRef * (1 - 0.0025 / 0.9975) / Number(objCriptos[str]['lowestAsk']);
							volOP = volOP.toFixed(8);
							
							volRemate = volOP * (1 - 0.0025 / 0.9975) * remate['highestBid'] /** (1 - 0.0025 / 0.9975)*/;
							volRemate = volRemate.toFixed(8);
							volRemate = volRemate * (1 - 0.0025 / 0.9975)/* * remate['highestBid']*/;
							volRemate = volRemate.toFixed(8);
							volRemate = volRemate - 1;
							volRemate = volRemate.toFixed(8);
							
							fsLauncher.appendFileSync('./ticker.txt', "[ " + (volRemate) + " ] ----> " + str + "\n", (err) => {
							if (err) throw err;
								////console.log('The "data to append" was appended to file!');
							});
							if(volRemate > 0){
								console.log("[ " + (volRemate) + " ] ----> " + str);
							}
							//console.log(precioDirecto);
							if(volRemate > 0){// && (precioTraspasando - precioDirecto) * 100 / precioDirecto > 0.09
								if(!evalMejor){
									evalMejor = {gasto: 'USDT_' + ref, ope: str, ganancia: 'USDT_' + monedas[1], result: volRemate, m1: objCriptos['USDT_' + ref]['lowestAsk'], m2: objCriptos[str]['highestBid'], m3: remate['lowestAsk']};
								} else if(volRemate > evalMejor.result){
									evalMejor = {gasto: 'USDT_' + ref, ope: str, ganancia: 'USDT_' + monedas[1], result: volRemate};
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
						fsLauncher.appendFileSync('./' + msg[1] + '.txt', JSON.stringify(evalMejor) + "\n", (err) => {
							if (err) throw err;
								////console.log('The "data to append" was appended to file!');
							});
						evalMejor = null;
						swOperacion = true;
						contBooks = 0;
						console.log('\u0007');
						
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
				/*fsLauncher.appendFileSync('./' + msg[1] + '.txt', channelName + ' ---> ' + JSON.stringify(obj) + "\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});*/
				
			} else if(!swOperacion){
				console.log("FIN OPERACION");
				fsLauncher.appendFileSync('./' + msg[1] + '.txt', "FIN OPERACION\n\n\n\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
				poloniex.unsubscribe(msg[0]);
				poloniex.unsubscribe(msg[1]);
				poloniex.unsubscribe(msg[2]);
				objCriptos = {};
				
				poloniex.subscribe('ticker');	
				ee.removeListener('orderBookRemove', orderBookModify);
				ee.removeListener('orderBookModify', orderBookModify);
				swBLoqueo = false;
					
				break;
			}
						
		}	   
	} 
});


function orderBookModify(channelName, obj){
	//console.log(channelName + '  HHHHHHHHH  ' + obj.data.type + " ES IGUAL A " + msg[1] + " ? ");
	//console.log(order);
	if(books[channelName]){
		
		if(obj.data.amount == 0){
			if(books[channelName] && books[channelName]["asks"] && books[channelName]["bids"]){
				//console.log(order);				
				for(let j = 0; j < books[channelName][obj.data.type + 's'].length; j++){
					let reg = books[channelName][obj.data.type + 's'][j];
					if(reg.rate == obj.data.rate){
						
						//console.log("ENCONTRADO EN " + j);
						books[channelName][obj.data.type + 's'].splice(j, 1);
						break;
					} 
					
				}
				
				//console.log("NO ENCONTRADO");
				
				
			}
		} else {
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
		}
		fnDiferencia(obj, channelName);		
	}
		
		
					
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
		ee.on('orderBookRemove', orderBookModify);
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


var opeComisPeg = (1 + 0.0025 / 0.9975);
function fnDiferencia(obj, channelName){
	
	if(contBooks == 3 && !swBLoqueo){	
		
		var ms = "";		
		if(order && order.orderNumber){
			precioOperacion = order.rate;
			ms = " referente a la orden ";
		} else {
			//precioOperacion = Number(books[msg[1]][opePeg][0].rate);
			ms = " sin una orden ";
			precioOperacion = Number(books[msg[1]]['asks'][0].rate)/* + 0.00000001*/;/*Number((books[msg[1]]['asks'][0].rate - books[msg[1]]['bids'][0].rate) / 12) + Number(books[msg[1]]['bids'][0].rate);*/
			precioOperacion = precioOperacion.toFixed(8);	
		}		
		
		precioTransada = books[msg[2]]["bids"][0].rate;		
		precioReferencia = books[msg[0]]["asks"][0].rate;		
		
		volRef = 2 / precioReferencia;
		volRef = volRef.toFixed(8);
		
		volOP = volRef * (1 - 0.0025 / 0.9975) / precioOperacion;
		volOP = volOP.toFixed(8);
		
		volRemate = volOP * (1 - 0.0025 / 0.9975);
		volRemate = volRemate.toFixed(8);
		
		var balance = (volRemate * (1 - 0.0025 / 0.9975) * precioTransada) - 2;
		
		if(order){
				
			
		} else {
			if(balance > 0){
				console.log("DIFERENCIA (SIN ORDEN): " + (balance) + " " + ms);
				fsLauncher.appendFileSync('./' + msg[1] + '.txt', "DIFERENCIA (SIN ORDEN): " + (balance) + " -----------> " + precioReferencia + ", " + precioOperacion + ", " + precioTransada + " " + ms + "\n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});
				fnEjecucion('fnDiferencia');
			} else {
				console.log("DIFERENCIA (SIN ORDEN): " + (balance) + " " + ms);
				fsLauncher.appendFileSync('./' + msg[1] + '.txt', "DIFERENCIA (SIN ORDEN): " + (balance) + " -----------> " + precioReferencia + ", " + precioOperacion + ", " + precioTransada + " " + ms + "\n", (err) => {
							if (err) throw err;
								////console.log('The "data to append" was appended to file!');
							});
				swOperacion = false;	
			}
			
		}
		
		return balance;// > 0 ? true : false;
	}
	//console.log("AUN NO DESUBSCRIBO " + contBooks);
	
	fsLauncher.appendFileSync('./' + msg[1] + '.txt', "XXXXXXX\n", (err) => {
		if (err) throw err;
			////console.log('The "data to append" was appended to file!');
		});
	return -1;
	
}

var countOrdenes = 0;
var objOrderNumber = {};

function fnConsultaOrdenes(){
	clientOrd.returnOpenOrders({currencyPair: 'all'}).then(response => {
		const { status, data } = response;
		  
		//console.log(data);
		
		fsLauncher.appendFileSync('./' + msg[1] + '.txt', "CONSULTA POR ORDEN : " + JSON.stringify(objOrderNumber) + "\n", (err) => {
		if (err) throw err;
			////console.log('The "data to append" was appended to file!');
		});
		
		
		
		var sw = false;
		for(var s = 0; s < data.length; s++){
			if(objOrderNumber[data[s].orderNumber]){	
				sw = true;									
				break;
			}							
		}
		
		if(!sw){			
			swOperacion = false;
			swBLoqueo = false;
			countOrdenes = 0;
			order = null;
			
		} else {
			swBLoqueo = false;	
			myFunction();
		}
			
			
	
		  
	  
	})
	.catch(err => {
	  //console.error(err);
	  swBLoqueo = false;
	});
	
	
}


function fnOrdenes(msg){
	 
    switch(msg.cmd){
        case 'fin proceso':
			countOrdenes++;
			objOrderNumber[msg.orderNumber] = msg.orderNumber;
			if(countOrdenes == 3){	
				poloniex.unsubscribe(msg[0]);
				poloniex.unsubscribe(msg[1]);
				poloniex.unsubscribe(msg[2]);	
				swBLoqueo = false;
				myFunction();
				
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


function fnEjecucion(st){
	
	if(swBLoqueo == false && order == null){// && books[channelName]['asks'] && books[channelName]['bids']){
		
		console.log("PETICION DE ORDEN " + msg[1]);
		fsLauncher.appendFileSync('./' + msg[1] + '.txt', "PETICION DE ORDEN " + msg[1] + ' desde ' + st + "\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
		swBLoqueo = true;
		//capital = capital * ((retorno - gasto) * 100 / gasto);
								
		
		//console.log({currencyPair: msg[2], rate: precioTransada, amount: volRemate});	
		
		var precOper = Number(books[msg[1]]['asks'][0].rate)/* - 0.00000001*/ /*+ 0.00000001*/;/*((Number(books[msg[1]]['asks'][0].rate) - Number(books[msg[1]]['bids'][0].rate)) / 16) + Number(books[msg[1]]['bids'][0].rate) + 0.00000001*/;
		precOper = precOper.toFixed(8);
		fsLauncher.appendFileSync('./' + msg[1] + '.txt', "{currencyPair: " + msg[1] + ", rate: " + precOper + ", amount: " + volOP + "}\n", (err) => {
			if (err) throw err;
				////console.log('The "data to append" was appended to file!');
			});
		order = {};
		order.rate = precOper;
		
		var objParam = {};
		objParam.opt = 'buy';
		objParam.data = {currencyPair: msg[1], rate: precOper, amount: volOP};															
		arrOrdenes[0].send(objParam);										
		console.log({currencyPair: msg[1], rate: precOper, amount: volOP})
		fsLauncher.appendFileSync('./' + msg[1] + '.txt', "PETICION DE ORDEN " + msg[2] + "\n" + JSON.stringify({currencyPair: msg[1], rate: precOper, amount: volOP}) + "\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
				
				
				
		var objParam = {};
		objParam.opt = 'buy';
		objParam.data = {currencyPair: msg[0], rate: Number(precioReferencia) /*- 0.00000001*/, amount: volRef};															
		arrOrdenes[1].send(objParam);										
		console.log({currencyPair: msg[0], rate: precioReferencia, amount: volRef})
		fsLauncher.appendFileSync('./' + msg[1] + '.txt', "PETICION DE ORDEN " + msg[2] + "\n" + JSON.stringify({currencyPair: msg[0], rate: precioReferencia, amount: volRef}) + "\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
		objParam.opt = 'sell';
		objParam.data = {currencyPair: msg[2], rate: Number(precioTransada)/* + 0.00000001*/, amount: volRemate};
		arrOrdenes[2].send(objParam);
		swOperacion = false;					
		order = null;
		fsLauncher.appendFileSync('./' + msg[1] + '.txt', "PETICION DE ORDEN " + msg[0] + "\n" + JSON.stringify({currencyPair: msg[2], rate: precioTransada, amount: volRemate}) + "\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
			
			
	}
}