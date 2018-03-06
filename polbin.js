const binance = require('node-binance-api');
binance.options({
  'APIKEY':'tfdrBVQrUdxkvRLDaMA6HnmTSNMBSlZcnDkPDLdjOGdecEJaVYxDZFugmzH5H1wb',
  'APISECRET':'0sxAG7s1t9YHxCBFJ91NiKyC1CKpZiA4rYyrR9sxAEwaxxhlXfR3aKUmkVMs41Dc'
});


const poloniexOrd = require('poloniex-exchange-api');
var fsLauncher = require('fs');

const clientOrd = poloniexOrd.getClient({
    publicKey : 'ZSJMN2PC-CHDIRN2Q-QNEIGD5E-6IQSVNGK', // Your public key
    privateKey: '0c6a560357d29eb001438d18783a73f3428f99516011b7f5e5511082b796c83ab7be50762b5ce525e4e45faeb9e6955e6a192efcd0c407087f6c61baba171701', // Your private key
});


const Poloniex = require('poloniex-api-node');
let poloniex = new Poloniex('WZG48KNT-L35B2XGQ-CDCU7AG1-DFG3NWC9', 
'966c91801fa03f37778de06e14b5fc6885a63f14220f446aaf698492df7da7b86556efe1751ce2083309348db66363664c2d22dbd82d664c7e6d6a74aa13677e');
const cluster = require('cluster');
poloniex.subscribe('ticker');


poloniex.on('message', (channelName, data, seq) => {
	if (channelName === 'ticker') {
		if(data.currencyPair == 'BTC_ETH'){
			fnCruce('pol', data, 'BTC_ETH', 'buy');
		}
	}
});


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

binance.websockets.depthCache(["BTCUSDT"], function(symbol, depth) {
	let max = 10; // Show 10 closest orders only
	let bids = binance.sortBids(depth.bids, max);
	let asks = binance.sortAsks(depth.asks, max);
	/*console.log(symbol+" depth cache update");
	console.log("asks", asks);
	console.log("bids", bids);
	console.log("ask: "+binance.first(asks));
	console.log("bid: "+binance.first(bids));*/
	fnCruce('bin', asks, 'BTCUSDT', 'buy');
});

binance.websockets.depthCache(["ETHBTC"], function(symbol, depth) {
	let max = 10; // Show 10 closest orders only
	let bids = binance.sortBids(depth.bids, max);
	let asks = binance.sortAsks(depth.asks, max);
	/*console.log(symbol+" depth cache update");
	console.log("asks", asks);
	console.log("bids", bids);
	console.log("ask: "+binance.first(asks));
	console.log("bid: "+binance.first(bids));*/
	fnCruce('bin', bids, 'ETHBTC', 'buy');
});

binance.websockets.depthCache(["ETHUSDT"], function(symbol, depth) {
	let max = 10; // Show 10 closest orders only
	let bids = binance.sortBids(depth.bids, max);
	let asks = binance.sortAsks(depth.asks, max);
	/*console.log(symbol+" depth cache update");
	console.log("asks", asks);
	console.log("bids", bids);
	console.log("ask: "+binance.first(asks));
	console.log("bid: "+binance.first(bids));*/
	fnCruce('bin', bids, 'ETHUSDT', 'sell');
});

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
	if(validacionDatos['ETHUSDT'] && validacionDatos['BTCUSDT'] && validacionDatos['ETHBTC'] && validacionDatos['BTC_ETH']){
		var result = 1 / binance.first(validacionDatos['BTCUSDT'].data);
		result = result * (1 - 0.001 / 0.999) / validacionDatos['BTC_ETH'].data.highestBid;//lowestAsk;
		result = result * (1 - 0.0015 / 0.9985) * binance.first(validacionDatos['ETHUSDT'].data);
		result = result * (1 - 0.001 / 0.999);
		result = result - 1;
		
		var result2 = 1 / binance.first(validacionDatos['BTCUSDT'].data);
		result2 = result2 * (1 - 0.001 / 0.999) / binance.first(validacionDatos['ETHBTC'].data);
		result2 = result2 * (1 - 0.001 / 0.999) * binance.first(validacionDatos['ETHUSDT'].data);
		result2 = result2 * (1 - 0.001 / 0.999);
		result2 = result2 - 1;
		if((result > 0 || result2 > 0) && !sw){
			console.log("*********************************************");
			sw = true;
			acum += Number(result) > 0 ? Number(result) : 0;
			acum2 += Number(result2) > 0 ? Number(result2) : 0;
			fsLauncher.appendFileSync('./bin.txt', " [ " + (acum) + " :: " + acum2 + " ]\n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});
		}
		if(result < 0 && result2 < 0 && sw){
			console.log("*********************************************");
			sw = false;
		}
		console.log("[ " + result + " :: " + result2 + " ]");
		
	}
}

