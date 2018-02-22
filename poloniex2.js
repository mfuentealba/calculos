const Poloniex = require('poloniex-api-node');
let poloniex = new Poloniex('Z3QXH3L0-AR8VP0ZA-PTR8VH8C-PBQO5LQU', '23b36c259b7a1af19dbf3b4bd444fd19e182637abd14fb62d1d784a711898939295b2fd96665a586c0d604f3296ba74731c029cddc6fb6d73b76a2b9f8744194');
const cluster = require('cluster');
 
poloniex.subscribe('ticker');
//poloniex.subscribe('BTC_ETC');
var objOperacion = {};
var swOperacion = false;
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
						/**************** CASO SEGURO ****************/	
						
						var ref = str.split('_')[0];
						if(objCriptos['USDT_' + ref] && objCriptos[str]['highestBid'] && objCriptos['USDT_' + ref]['highestBid']){
							if(objCriptos[str]['highestBid'] * objCriptos['USDT_' + ref]['highestBid'] < remate['lowestAsk']){
								var precioTraspasando = objCriptos[str]['lowestAsk'] * objCriptos['USDT_' + ref]['lowestAsk'];
								precioTraspasando = precioTraspasando/(0.9975 * 0.9975);
								var precioDirecto = remate['highestBid'] * (1 - 0.0025 / 0.9975);
								if(precioTraspasando - precioDirecto > 0){
									console.log("*******************************************************************************");
									console.log(str + ' lowestAsk --> ' + objCriptos[str]['lowestAsk']);
									console.log('USDT_' + ref + ' lowestAsk --> ' + objCriptos['USDT_' + ref]['lowestAsk']);
									console.log(' RESULTADO --> ' + precioTraspasando);
									console.log('USDT_' + monedas[1] + ' highestBid --> ' + precioDirecto);									
									console.log(precioTraspasando - precioDirecto);
									console.log(((precioTraspasando - precioDirecto) * 100 / precioDirecto) + '%');
									console.log("*******************************************************************************");	
									swOperacion = true;
									var wk = cluster.fork();
									//wk.socket = this;
									console.log(wk.process.pid);
									objOperacion[wk.process.pid] = ['USDT_' + ref, str, 'USDT_' + monedas[1], ];
									console.log(objOperacion[wk.process.pid]);
									wk.on('message', fnMaster);
									break;
								}	
							}							
						}
						
						/************************************************/
						
						//res[str] = {objCriptos[data.currencyPair].objCriptos['USDT_' + str]}
						
					}	
				}
				
			}
		}
		
	  }
	}
	
 
  if (channelName === 'BTC_ETC') {
	   console.log(data);
	   console.log("*******************************************************************************");	
	   
	   
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
			//swOperacion = false;
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




