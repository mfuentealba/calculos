const poloniexOrd = require('poloniex-exchange-api');

const clientOrd = poloniexOrd.getClient({
    publicKey : 'WZG48KNT-L35B2XGQ-CDCU7AG1-DFG3NWC9', // Your public key
    privateKey: '966c91801fa03f37778de06e14b5fc6885a63f14220f446aaf698492df7da7b86556efe1751ce2083309348db66363664c2d22dbd82d664c7e6d6a74aa13677e', // Your private key
});





var books = {};
var channelName = 'BTC_ETC';
books[channelName] = {};
var reg = 'ask';
var libro = 'asks';

		
		

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


/*
clientOrd.returnOpenOrders({currencyPair: 'BTC_ETC'}).then(response => {
							  const { status, data } = response;
							  console.log(data);
							  
								
							  
						  })
						  .catch(err => console.error(err));	*/
/*

clientOrd.sell({currencyPair: 'USDT_BTC', rate: 15000, amount: 0.001, nonce: 9196535984736059393})
      .then(response => {
          const { status, data } = response;
		  console.log(data);
		  
		  
			clientOrd.returnOpenOrders({currencyPair: 'USDT_BTC'}).then(response => {
			  const { status, data } = response;
			  console.log("CANTIDAD ORDENES");
			  console.log(data);
				clientOrd.cancelOrder({orderNumber:data[0].orderNumber}).then(response => {
									  const { status, data } = response;
									  console.log(data);
									  //process.send({ cmd: 'fin proceso', capital: capital });
									  swBLoqueo = false;
								  })
								  .catch(err => console.error(err));			  
			  
		  })
		  .catch(err => console.error(err));						  
		  
		  
		  
      })
      .catch(err => console.error(err));
	  
	  
*/


 
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


cluster.setupMaster({
				  exec: 'operacionP.js',    
				  args: [],
				  silent: false
			  });
				

var objCriptos = {};
var objRematablesUSDT = {ETC: 'ETC', XRP: 'XRP', ETH: 'ETH', LTC: 'LTC', BCH: 'BCH', STR: 'STR', XMR: 'XMR', ZEC: 'ZEC', NXT: 'NXT', DASH: 'DASH', REP: 'REP'};
poloniex.on('message', (channelName, data, seq) => {
  if (channelName === 'ticker') {
    objCriptos[data.currencyPair] = data;
	//console.log(data);
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
					for(var str in obj){					
						
						/**************** MEJOR CASO ****************/
						/*var ref = str.split('_')[0];
						if(objCriptos['USDT_' + ref] && objCriptos[str]['highestBid'] && objCriptos['USDT_' + ref]['highestBid']){
							if(objCriptos[str]['highestBid'] * objCriptos['USDT_' + ref]['highestBid'] < remate['lowestAsk']){
								var precioTraspasando = objCriptos[str]['highestBid'] * objCriptos['USDT_' + ref]['highestBid'];
								precioTraspasando = precioTraspasando/(0.9985 * 0.9985);
								var precioDirecto = remate['lowestAsk'] * (1 - 0.0015 / 0.9985);
								if(precioTraspasando - precioDirecto > 0){
									console.log("*******************************************************************************");
									console.log(str + ' highestBid --> ' + objCriptos[str]['highestBid']);
									console.log('USDT_' + ref + ' highestBid --> ' + objCriptos['USDT_' + ref]['highestBid']);
									console.log(' RESULTADO --> ' + precioTraspasando);
									console.log('USDT_' + monedas[1] + ' lowestAsk --> ' + precioDirecto);									
									console.log(precioTraspasando - precioDirecto);
									console.log(((precioTraspasando - precioDirecto) * 100 / precioDirecto) + '%');
									console.log("*******************************************************************************");	
									swOperacion = true;
									var wk = cluster.fork();
									wk.socket = this;
									objOperacion[wk.process.pid] = [str, data.currencyPair, 'USDT_' + ref];
									wk.on('message', fnMaster);
								}	
							}							
						}*/
						/**************** CASO ESPERA ****************/	
						
						
						var ref = str.split('_')[0];
						if(objCriptos['USDT_' + ref] && objCriptos[str]['lowestAsk'] && objCriptos['USDT_' + ref]['lowestAsk']){
							
							var precioTraspasando = (1 - 0.0015 / 0.9985) * remate['highestBid'] * (1 - 0.0025 / 0.9975);
							var precioT = (1 - 0.0025 / 0.9975) * remate['highestBid'] * (1 - 0.0025 / 0.9975);
							precioTraspasando = precioTraspasando.toFixed(8);
							var precioDirecto = objCriptos['USDT_' + ref]['lowestAsk'] * (1 + 0.0025 / 0.9975) * objCriptos[str]['highestBid'];
							var precioD = objCriptos['USDT_' + ref]['lowestAsk'] * (1 + 0.0025 / 0.9975) * objCriptos[str]['lowestAsk'];
							precioDirecto = precioDirecto.toFixed(8);
							var evaluacion = precioTraspasando - precioDirecto;
							if(precioT - precioD > 0){
								console.log("[ " + evaluacion.toFixed(8) + " -------- " + (precioT - precioD) + " ]");
							}
								
							
							
							
							//console.log(precioDirecto);
							if(precioTraspasando - precioDirecto > 0){// && (precioTraspasando - precioDirecto) * 100 / precioDirecto > 0.09
								console.log("*******************************************************************************");
								
								console.log(str + ' highestBid --> ' + objCriptos[str]['highestBid']);
								console.log('USDT_' + ref + ' lowestAsk --> ' + objCriptos['USDT_' + ref]['lowestAsk']);
								console.log('USDT_' + monedas[1] + ' highestBid --> ' + precioDirecto);
								console.log(' RESULTADO --> ' + precioTraspasando);
																	
								console.log(precioTraspasando - precioDirecto);
								acum += (precioTraspasando - precioDirecto) / precioDirecto;
								console.log(((precioTraspasando - precioDirecto) * 100 / precioDirecto) + '%');
								capital = capital * (1 + (precioTraspasando - precioDirecto)/ precioDirecto);
								console.log("\n\n\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
								console.log("**** RESULTADO: " + capital + " ****");
								console.log("**** RESULTADO: " + acum + " ****");
								console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\n\n");
								
								
								
								console.log("*******************************************************************************");	
								
								swOperacion = true;								
								var wk = cluster.fork();
								//wk.socket = this;
								console.log(wk.process.pid);
								objOperacion[wk.process.pid] = {data: ['USDT_' + ref, str, 'USDT_' + monedas[1]], opt: 'ESPERA', capital: capital};;
								console.log(objOperacion[wk.process.pid]);
								wk.on('message', fnMaster);								
								poloniex.unsubscribe('ticker');
								break;
							}
											
						}
						
						
						
						
						/**************** CASO SEGURO ****************/	
						
						/*
						var ref = str.split('_')[0];
						if(objCriptos['USDT_' + ref] && objCriptos[str]['lowestAsk'] && objCriptos['USDT_' + ref]['lowestAsk']){
							
							var precioTraspasando = (1 - 0.0025 / 0.9975) * remate['highestBid'] * (1 - 0.0025 / 0.9975);
							var precioT = (1 - 0.0025 / 0.9975) * remate['highestBid'] * (1 - 0.0025 / 0.9975);
							precioTraspasando = precioTraspasando.toFixed(8);
							var precioDirecto = objCriptos['USDT_' + ref]['lowestAsk'] * (1 + 0.0025 / 0.9975) * objCriptos[str]['lowestAsk'];
							var precioD = objCriptos['USDT_' + ref]['lowestAsk'] * (1 + 0.0025 / 0.9975) * objCriptos[str]['lowestAsk'];
							precioDirecto = precioDirecto.toFixed(8);
							var evaluacion = precioTraspasando - precioDirecto;
							//if(precioT - precioD > 0){
								//console.log("[ " + evaluacion.toFixed(8) + " -------- " + (precioT - precioD) + " ]");
							//}
								
							
							if(precioTraspasando - precioDirecto > 0){// && (precioTraspasando - precioDirecto) * 100 / precioDirecto > 0.09
								console.log("*******************************************************************************");
								
								console.log(str + ' lowestAsk --> ' + objCriptos[str]['lowestAsk']);
								console.log('USDT_' + ref + ' lowestAsk --> ' + objCriptos['USDT_' + ref]['lowestAsk']);
								console.log('USDT_' + monedas[1] + ' highestBid --> ' + precioDirecto);
								console.log(' RESULTADO --> ' + precioTraspasando);
								
								
								
																	
								console.log(precioTraspasando - precioDirecto);
								acum += (precioTraspasando - precioDirecto) / precioDirecto;
								console.log(((precioTraspasando - precioDirecto) * 100 / precioDirecto) + '%');
								capital = capital * (1 + (precioTraspasando - precioDirecto)/ precioDirecto);
								console.log("\n\n\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
								console.log("**** RESULTADO: " + capital + " ****");
								console.log("**** RESULTADO: " + acum + " ****");
								console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\n\n");
								
								
								
								console.log("*******************************************************************************");	
								
								var vol = 2 / objCriptos['USDT_' + ref]['lowestAsk'];
								vol = vol.toFixed(8);
								console.log({currencyPair: 'USDT_' + ref, rate: objCriptos['USDT_' + ref]['lowestAsk'], amount: vol});
								var objParam = {};
								objParam.opt = 'buy';
								objParam.data = {currencyPair: 'USDT_' + ref, rate: objCriptos['USDT_' + ref]['lowestAsk'], amount: vol}
								arrOrdenes[0].send(objParam);
								
								
								vol = vol * (1 - 0.0025 / 0.9975) / objCriptos[str]['lowestAsk'];
								vol = vol.toFixed(8);
								console.log({currencyPair: str, rate: objCriptos[str]['lowestAsk'], amount: vol});
								objParam.data = {currencyPair: str, rate: objCriptos[str]['lowestAsk'], amount: vol};							
								
								arrOrdenes[1].send(objParam);
								
								vol = vol * (1 - 0.0025 / 0.9975);
								vol = vol.toFixed(8);
								console.log({currencyPair: 'USDT_' + monedas[1], rate: remate['highestBid'], amount: vol});	
								
								objParam.opt = 'sell';
								objParam.data = {currencyPair: 'USDT_' + monedas[1], rate: remate['highestBid'], amount: vol}
								arrOrdenes[2].send(objParam);
								
								

								console.log("***************** DESUSCRIPCION ***************");	
								//poloniex.unsubscribe('ticker');
								
								
								
								
								
								
								
								//vol = (vol * (1 - 0.0025 / 0.9975));
								//vol = vol.toFixed(8);
								//console.log("**** RESULTADO CAJA: " + vol + " ****");
								
								  
								  
								
								  
								  
								  
								
								
								
								
								swOperacion = true;
								var wk = cluster.fork();
								//wk.socket = this;
								console.log(wk.process.pid);
								objOperacion[wk.process.pid] = {data: ['USDT_' + ref, str, 'USDT_' + monedas[1]], opt: 'SEGURO', capital: capital};
								console.log(objOperacion[wk.process.pid]);
								wk.on('message', fnMaster);
								//break;
								
							}
										
						
						
						}	*/
						/************************************************/
						//res[str] = {objCriptos[data.currencyPair].objCriptos['USDT_' + str]}
					}						
				}	
			}
				
		}
	}
		
	  
}
	
 
  if (channelName === 'BTC_ETC') {
	   //console.log(data);
	   console.log("*******************************************************************************");	
		var  i = 0;
		

		for(var obj of data){
			
			switch(obj.type){
				case "orderBook":
					books[channelName]["asks"] = [];//obj.data.asks;
					books[channelName]["bids"] = [];//obj.data.bids;
					
					console.log("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
					
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
					
					
				break;
				case "orderBookModify":
					//console.log(channelName);
					if(obj.data.type == 'bid'){
						console.log(obj);	
					}
					
					/*console.log(obj.data.type + 's');
					console.log(books[channelName]);
					console.log(books[channelName][obj.data.type + 's']);
					console.log(books[channelName][obj.data.type + 's'].length - 1);
					console.log(books[channelName][obj.data.type + 's'][books[channelName][obj.data.type + 's'].length - 1]);
					console.log(books[channelName][obj.data.type + 's'][books[channelName][obj.data.type + 's'].length - 1].rate);
					*/
					if(obj.data.type == 'ask'){
						if(obj.data.rate == books[channelName][obj.data.type + 's'][0].rate){
							console.log("ES IGUAL AL [0]");
							books[channelName][obj.data.type + 's'][0].amount = obj.data.amount;
							
						} else if(obj.data.rate < books[channelName][obj.data.type + 's'][0].rate){
							console.log("ES MENOR");
							books[channelName][obj.data.type + 's'].unshift({rate: obj.data.rate, amount: obj.data.amount});
							
						} else if(obj.data.rate > books[channelName][obj.data.type + 's'][0].rate && obj.data.rate < books[channelName][obj.data.type + 's'][books[channelName][obj.data.type + 's'].length - 1].rate){
							console.log("ESTA EN EL LIBRO");
							console.log(books[channelName][obj.data.type + 's'].length);
							for(let j = 0; j < books[channelName][obj.data.type + 's'].length; j++){
								let reg = books[channelName][obj.data.type + 's'][j];
								if(reg.rate == obj.data.rate){
									console.log("ENCONTRADO EN " + j);
									reg.amount = obj.data.amount;
									break;
								} else if(reg.rate > obj.data.rate){
									console.log(reg.rate + " > " + obj.data.rate);
									//console.log(books[channelName][obj.data.type + 's']);
									books[channelName][obj.data.type + 's'].splice(j, 0, {rate: obj.data.rate, amount: obj.data.amount});
									break;
								}
								
							}
							console.log("SALI");
						} else {
							console.log("MAYOR AL LIBRO");
							books[channelName][obj.data.type + 's'].push({rate: obj.data.rate, amount: obj.data.amount});
							
						}	
					} else {
						if(obj.data.rate == books[channelName][obj.data.type + 's'][0].rate){
							console.log("ES IGUAL AL [0]");
							books[channelName][obj.data.type + 's'][0].amount = obj.data.amount;
							
						} else if(obj.data.rate > books[channelName][obj.data.type + 's'][0].rate){
							console.log("ES MAYOR");
							books[channelName][obj.data.type + 's'].unshift({rate: obj.data.rate, amount: obj.data.amount});
							
						} else if(obj.data.rate < books[channelName][obj.data.type + 's'][0].rate && obj.data.rate > books[channelName][obj.data.type + 's'][books[channelName][obj.data.type + 's'].length - 1].rate){
							console.log("ESTA EN EL LIBRO");
							console.log(books[channelName][obj.data.type + 's'].length);
							for(let j = 0; j < books[channelName][obj.data.type + 's'].length; j++){
								let reg = books[channelName][obj.data.type + 's'][j];
								if(reg.rate == obj.data.rate){
									console.log("ENCONTRADO EN " + j);
									reg.amount = obj.data.amount;
									break;
								} else if(reg.rate < obj.data.rate){
									console.log(reg.rate + " < " + obj.data.rate);
									//console.log(books[channelName][obj.data.type + 's']);
									books[channelName][obj.data.type + 's'].splice(j, 0, {rate: obj.data.rate, amount: obj.data.amount});
									break;
								}
								
							}
							console.log("SALI");
						} else {
							console.log("MAYOR AL LIBRO");
							books[channelName][obj.data.type + 's'].push({rate: obj.data.rate, amount: obj.data.amount});
							
						}	
					}
					
					
					
					if(obj.data.type == 'bid'){
						console.log(books[channelName]["bids"]);
					}
					
					
				break;
				case "orderBookRemove":
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
					if(obj.data.type == 'bid'){
						console.log(books[channelName]["bids"]);
					}
				break;
			}	
		
	   
		}
	   
	   
	   
    /*console.log(`order book and trade updates received for currency pair ${channelName}`);
    console.log(`data sequence number is ${seq}`);*/
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



function fnMaster(msg){
	 
    switch(msg.cmd){
        case 'fin proceso':
			if(capital < msg.capital){
				capital = msg.capital;	
			}
			
			console.log("\n\n\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
			console.log("**** RESULTADO: " + capital + " ****");
			console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\n\n");
			
			poloniex.subscribe('ticker');
			swOperacion = false;
        break;
        default:
            //this.send('MASTER: Listo el proceso {' + process.pid + '}');	
			/*console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
			console.log(this.pid);
			console.log(process.pid);
			console.log(objOperacion[process.pid]);
			this.send('MASTER: Listo el proceso {' + process.pid + '}');
			console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");*/
            this.send(objOperacion[msg.cmd]);            
        break;
    }
	
}

function fnOrdenes(msg){
	 
    switch(msg.cmd){
        case 'fin proceso':
			
        break;
        default:
			/*var obj = {};
			obj.opt = 'sell';
			obj.data = {currencyPair: 'USDT_BTC', rate: 15000, amount: 0.001};
			this.send(obj);*/
        break;
    }
	
}


