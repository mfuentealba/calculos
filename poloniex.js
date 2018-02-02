const poloniex = require('poloniex-exchange-api');


 
const client = poloniex.getClient({
    publicKey : 'Z3QXH3L0-AR8VP0ZA-PTR8VH8C-PBQO5LQU', // Your public key
    privateKey: '23b36c259b7a1af19dbf3b4bd444fd19e182637abd14fb62d1d784a711898939295b2fd96665a586c0d604f3296ba74731c029cddc6fb6d73b76a2b9f8744194', // Your private key
});
 

	  
	  

	  
	  
	  
	  
//const cluster = require('cluster');



var markets = [{nombre: 'BTC_ETH', code: 'ETH/BTC'}, {nombre: 'eth-clp', code: 'ETH/CLP'}, {nombre: 'bch-clp', code: 'BCH/CLP'}, 
{nombre: 'eth-btc', code: 'ETH/BTC'}, {nombre: 'bch-btc', code: 'BCH/BTC'}];
var ejecucionSouth = 0;
var objResult = {};

function fnTrades(){
	try {
		console.log(markets[0].nombre);
	  	client.returnPublicTradeHistory(markets[0].nombre, 20)
      .then(response => {
          const { status, data } = response;
		  console.log(data);
          obj.trades = data;
		  
		  
		  
		  
		  
      }).catch(err => console.error(err));
		
		
		
		
			

	  
	}
	  catch(err) {
	  console.log('Error inesperado:');
	  console.log('\t' + err);
	}	
	
}


var obj = {};

//process.on('message', (msg) => {
	console.log('inicio Proceso');
	
	client.returnOrderBook()
      .then(response => {
          const { status, data } = response;
		  console.log(data);
          obj.libros = data;
		  obj.trades = {};
		  
		  fnTrades();
		  
		  
      })
      .catch(err => console.error(err));	
		
//});


	

//process.send({ cmd: process.pid });