const Poloniex = require('poloniex-api-node');
let poloniex = new Poloniex('Z3QXH3L0-AR8VP0ZA-PTR8VH8C-PBQO5LQU', '23b36c259b7a1af19dbf3b4bd444fd19e182637abd14fb62d1d784a711898939295b2fd96665a586c0d604f3296ba74731c029cddc6fb6d73b76a2b9f8744194');
 
poloniex.subscribe('ticker');
//poloniex.subscribe('BTC_ETC');

var BTC_XMR;
var BTC_USDT;

var objCriptos = {};
var objRematablesUSDT = {ETC: 'ETC', XRP: 'XRP', ETH: 'ETH', LTC: 'LTC', BCH: 'BCH', STR: 'STR', XMR: 'XMR', ZEC: 'ZEC', NXT: 'NXT', DASH: 'DASH', REP: 'REP'};
poloniex.on('message', (channelName, data, seq) => {
  if (channelName === 'ticker') {
    objCriptos[data.currencyPair] = data;
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	if(data.currencyPair != 'USDT_BTC' && data.currencyPair != 'USDT_XMR' && data.currencyPair != 'USDT_ETH'){
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
						
						
						
						var ref = str.split('_')[0];
						if(objCriptos[str]['highestBid'] && objCriptos['USDT_' + ref]['highestBid'] && objCriptos[str]['highestBid'] * objCriptos['USDT_' + ref]['highestBid'] < remate['lowestAsk']){
							if(objCriptos[str]['highestBid'] * objCriptos['USDT_' + ref]['highestBid'] / remate['lowestAsk'] < 0.99){
								console.log("*******************************************************************************");
								console.log(str + ' highestBid --> ' + objCriptos[str]['highestBid']);
								console.log('USDT_' + ref + ' highestBid --> ' + objCriptos['USDT_' + ref]['highestBid']);
								console.log(' RESULTADO --> ' + (objCriptos[str]['highestBid'] * objCriptos['USDT_' + ref]['highestBid']));
								console.log('USDT_' + monedas[1] + ' lowestAsk --> ' + remate['lowestAsk']);
								console.log(objCriptos[str]['highestBid'] * objCriptos['USDT_' + ref]['highestBid'] / remate['lowestAsk']);
								console.log("*******************************************************************************");	
							}
							
							
						}
						
						
						//res[str] = {objCriptos[data.currencyPair].objCriptos['USDT_' + str]}
						
					}	
				}
				
			}
		}
		
	  }
	}
	
 
  if (channelName === 'BTC_ETC') {
	   console.log(data);
	   if(objCriptos['USDT_BTC']){
		   
		   
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