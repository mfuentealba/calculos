const poloniex = require('poloniex-exchange-api');


 
const client = poloniex.getClient({
    publicKey : 'Z3QXH3L0-AR8VP0ZA-PTR8VH8C-PBQO5LQU', // Your public key
    privateKey: '23b36c259b7a1af19dbf3b4bd444fd19e182637abd14fb62d1d784a711898939295b2fd96665a586c0d604f3296ba74731c029cddc6fb6d73b76a2b9f8744194', // Your private key
});
 

	  
	  

	  
	  
	  
	  
const cluster = require('cluster');



var markets = [];
var ejecucionSouth = 0;
var objResult = {};

function fnTrades(){
	try {
		//console.log(markets[0].nombre);
		var dx = new Date();
		var d = Math.round((new Date().getTime() - 3000000) / 1000);//dx.getFullYear(), dx.getMonth(), dx.getDate())
		var d2 = Math.round((new Date()).getTime() / 1000);
		console.log(d);
		console.log(d2);
		
		
		
	  	client.returnPublicTradeHistory({currencyPair: markets[ejecucionSouth], start: d,  end: d2})
      .then(response => {
          const { status, data } = response;
		  console.log(data);
          obj.trades[markets[ejecucionSouth]] = data;
		  
		  ejecucionSouth++;
		  if(ejecucionSouth == markets.length){
			  var j = { cmd: 'fin proceso', data: process.pid, info: obj};	  
			  process.send(j);
			  process.exit();
		  } else {
			  fnTrades();
		  }
		  
      }).catch(err => console.error(err));
		
		
		 
		  
	  
	}
	  catch(err) {
	  console.log('Error inesperado:');
	  console.log('\t' + err);
	}	
	
}


var obj = {};

process.on('message', (msg) => {
	console.log('inicio Proceso');
	
		
	
	
	
	client.returnOrderBook()
      .then(response => {
          const { status, data } = response;
		  console.log(data);
		  for(var d in data){			  
			  markets[markets.length] = d;
		  }  
		  
          obj.libros = data;
		  obj.trades = {};
		  
		  fnTrades();
		  
		  
      })
      .catch(err => console.error(err));	
		
});


	

process.send({ cmd: process.pid });