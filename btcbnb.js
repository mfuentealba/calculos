const binance = require('node-binance-api');
binance.options({
  'APIKEY':'tfdrBVQrUdxkvRLDaMA6HnmTSNMBSlZcnDkPDLdjOGdecEJaVYxDZFugmzH5H1wb',
  'APISECRET':'0sxAG7s1t9YHxCBFJ91NiKyC1CKpZiA4rYyrR9sxAEwaxxhlXfR3aKUmkVMs41Dc'
});



const cluster = require('cluster');



binance.websockets.depthCache(["BNBBTC"], function(symbol, depth) {
	let max = 10; // Show 10 closest orders only
	let bids = binance.sortBids(depth.bids, max);
	let asks = binance.sortAsks(depth.asks, max);
	/*console.log(symbol+" depth cache update");
	console.log("asks", asks);
	console.log("bids", bids);
	console.log("ask: "+binance.first(asks));
	console.log("bid: "+binance.first(bids));*/
	fnCruce('bin', asks, 'BNBBTC', 'buy');
	fnCruce('bin', bids, 'BNBBTC_', 'sell');
});




binance.websockets.depthCache(["ONTBNB"], function(symbol, depth) {
	let max = 10; // Show 10 closest orders only
	let bids = binance.sortBids(depth.bids, max);
	let asks = binance.sortAsks(depth.asks, max);
	/*console.log(symbol+" depth cache update");
	console.log("asks", asks);
	console.log("bids", bids);
	console.log("ask: "+binance.first(asks));
	console.log("bid: "+binance.first(bids));*/
	fnCruce('bin', asks, 'ONTBNB', 'buy');
});

binance.websockets.depthCache(["ONTBTC"], function(symbol, depth) {
	let max = 10; // Show 10 closest orders only
	let bids = binance.sortBids(depth.bids, max);
	let asks = binance.sortAsks(depth.asks, max);
	/*console.log(symbol+" depth cache update");
	console.log("asks", asks);
	console.log("bids", bids);
	console.log("ask: "+binance.first(asks));
	console.log("bid: "+binance.first(bids));*/
	fnCruce('bin', bids, 'ONTBTC', 'sell');
});



binance.websockets.depthCache(["ONTBTC"], function(symbol, depth) {
	let max = 10; // Show 10 closest orders only
	let bids = binance.sortBids(depth.bids, max);
	let asks = binance.sortAsks(depth.asks, max);
	/*console.log(symbol+" depth cache update");
	console.log("asks", asks);
	console.log("bids", bids);
	console.log("ask: "+binance.first(asks));
	console.log("bid: "+binance.first(bids));*/
	fnCruce('bin', asks, 'ONTBTC', 'buy');
});

binance.websockets.depthCache(["ONTBNB"], function(symbol, depth) {
	let max = 10; // Show 10 closest orders only
	let bids = binance.sortBids(depth.bids, max);
	let asks = binance.sortAsks(depth.asks, max);
	/*console.log(symbol+" depth cache update");
	console.log("asks", asks);
	console.log("bids", bids);
	console.log("ask: "+binance.first(asks));
	console.log("bid: "+binance.first(bids));*/
	fnCruce('bin', bids, 'ONTBNB', 'sell');
});





var fsLauncher = require('fs');

var validacionDatos = {};
var sw = false;
var acum = 0;
var acum2 = 0;
function fnCruce(orig, data, currencyPair, op){
	if(!validacionDatos[currencyPair]){
		validacionDatos[currencyPair] = {};
		validacionDatos[currencyPair].op = op;	
	} 
	
	validacionDatos[currencyPair].data = data;
	//console.log(currencyPair);
	if(validacionDatos['BNBBTC'] && validacionDatos['ONTBNB'] && validacionDatos['ONTBTC']){
		var result = 1 / binance.first(validacionDatos['BNBBTC'].data)
		/*console.log(binance.first(validacionDatos['BTCBNB'].data));
		console.log(result);*/
		result = result * (1 - 0.001 / 0.999) / binance.first(validacionDatos['ONTBNB'].data);//lowestAsk;
		//console.log(result);
		result = result * (1 - 0.001 / 0.999) * binance.first(validacionDatos['ONTBTC'].data);
		//console.log(result);
		result = result * (1 - 0.001 / 0.999);
		//console.log(result);
		result = result - 1;
		//console.log(result);
		
	
		if((result > 0 ) && !sw){
			console.log("*********************************************");
			sw = true;
			acum += Number(result) > 0 ? Number(result) : 0;
			
			fsLauncher.appendFileSync('./bin2.txt', " [ " + (acum) + " ]\n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});
		}
		if(result < 0 && sw){
			console.log("*********************************************");
			sw = false;
		}
		console.log("[ " + result + " ]");
		
	}
}

