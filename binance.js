/*API Key:
tfdrBVQrUdxkvRLDaMA6HnmTSNMBSlZcnDkPDLdjOGdecEJaVYxDZFugmzH5H1wb

Secret:
0sxAG7s1t9YHxCBFJ91NiKyC1CKpZiA4rYyrR9sxAEwaxxhlXfR3aKUmkVMs41Dc*/

const binance = require('node-binance-api');
binance.options({
  APIKEY: 'tfdrBVQrUdxkvRLDaMA6HnmTSNMBSlZcnDkPDLdjOGdecEJaVYxDZFugmzH5H1wb',
  APISECRET: '0sxAG7s1t9YHxCBFJ91NiKyC1CKpZiA4rYyrR9sxAEwaxxhlXfR3aKUmkVMs41Dc',
  useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
  test: true // If you want to use sandbox mode where orders are simulated
});




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
	
	/*binance.trades("LTCBTC", (error, trades, symbol) => {
  console.log(symbol+" trade history", trades);
});*/

binance.depth("BNBBTC", (error, depth, symbol) => {
  console.log(symbol+" market depth", depth);
});
	
/*	binance.prices((error, ticker) => {
  console.log("prices()", ticker);
  console.log("Price of BTC: ", ticker.BTCUSDT);
});


binance.bookTickers((error, ticker) => {
  console.log("bookTickers()", ticker);
  console.log("Price of BNB: ", ticker.BNBBTC);
});
	*/
	/*console.log('inicio Proceso');
	binance.bookTickers((error, ticker) => {
	  console.log("bookTickers()", ticker);
	  console.log("Price of BNB: ", ticker.BNBBTC);
	  // fnTrades();
	});*/
	
		
//});


	

//process.send({ cmd: process.pid });