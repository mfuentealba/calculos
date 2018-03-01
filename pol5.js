const poloniexOrd = require('poloniex-exchange-api');

const clientOrd = poloniexOrd.getClient({
    publicKey : 'WZG48KNT-L35B2XGQ-CDCU7AG1-DFG3NWC9', // Your public key
    privateKey: '966c91801fa03f37778de06e14b5fc6885a63f14220f446aaf698492df7da7b86556efe1751ce2083309348db66363664c2d22dbd82d664c7e6d6a74aa13677e', // Your private key
});

const Poloniex = require('poloniex-api-node');
let poloniex = new Poloniex('WZG48KNT-L35B2XGQ-CDCU7AG1-DFG3NWC9', 
'966c91801fa03f37778de06e14b5fc6885a63f14220f446aaf698492df7da7b86556efe1751ce2083309348db66363664c2d22dbd82d664c7e6d6a74aa13677e');
const cluster = require('cluster');
var capital = 1;
var acum = 0;


poloniex.subscribe('ticker');
var objCriptos = {};
var objRematablesUSDT = {ETC: 'ETC', XRP: 'XRP', ETH: 'ETH', LTC: 'LTC', BCH: 'BCH', STR: 'STR', XMR: 'XMR', ZEC: 'ZEC', NXT: 'NXT', DASH: 'DASH', REP: 'REP'};
var swOperacion = false;

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
			var x;
			if(change > 1){
				var res = {};
				
				var remate = objCriptos['USDT_' + monedas[1]];
				if(remate){
					var evalMejor;
					for(var str in obj){					
											
						var ref = str.split('_')[0];
						if(objCriptos['USDT_' + ref] && objCriptos[str]['lowestAsk'] && objCriptos['USDT_' + ref]['lowestAsk']){
							
							var precioTraspasando = (1 - 0.0015 / 0.9985) * remate['lowestAsk'] * (1 - 0.0025 / 0.9975);
							
							precioTraspasando = precioTraspasando.toFixed(8);
							var precioDirecto = objCriptos['USDT_' + ref]['lowestAsk'] * (1 + 0.0025 / 0.9975) * objCriptos[str]['highestBid'];
							
							precioDirecto = precioDirecto.toFixed(8);
							var evaluacion = precioTraspasando - precioDirecto;
							if(precioTraspasando - precioDirecto > 0){
								console.log("[ " + evaluacion.toFixed(8) + " -------- " + (precioTraspasando - precioDirecto) + " ]");
							}
							//console.log(precioDirecto);
							if(precioTraspasando - precioDirecto > 0){// && (precioTraspasando - precioDirecto) * 100 / precioDirecto > 0.09
								if(!evalMejor){
									evalMejor = {gasto: 'USDT_' + ref, ope: str, ganancia: 'USDT_' + monedas[1], result: precioTraspasando - precioDirecto};
								} else if(precioTraspasando - precioDirecto > evalMejor.result){
									evalMejor = {gasto: 'USDT_' + ref, ope: str, ganancia: 'USDT_' + monedas[1], result: precioTraspasando - precioDirecto};
								}
								
							}
											
						}
						
						
						/************************************************/
						//res[str] = {objCriptos[data.currencyPair].objCriptos['USDT_' + str]}
					}	
					if(evalMejor){
						
						msg = [];
						msg[0] = evalMejor.gasto;
						msg[1] = evalMejor.ope;
						msg[2] = evalMejor.ganancia;
						
						console.log(msg);
						if(!x){
							poloniex.subscribe('USDT_' + ref);
							poloniex.subscribe(str);
							poloniex.subscribe('USDT_' + monedas[1]);
							poloniex.unsubscribe('ticker');	
						}
								
						console.log("SUSCRITOS");	
						evalMejor = null;
						x = {};
					}
					
				}	
			}
				
		}
	}  
  }  else if(swOperacion == false) {
		console.log(data);
		poloniex.unsubscribe('all');
		poloniex.unsubscribe(msg[1]);
		poloniex.unsubscribe(msg[2]);
		poloniex.subscribe('ticker');		
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
  console.error(error);
});
 
poloniex.openWebSocket({ version: 2 });