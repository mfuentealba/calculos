const binance = require('node-binance-api');
binance.options({
  'APIKEY':'tfdrBVQrUdxkvRLDaMA6HnmTSNMBSlZcnDkPDLdjOGdecEJaVYxDZFugmzH5H1wb',
  'APISECRET':'0sxAG7s1t9YHxCBFJ91NiKyC1CKpZiA4rYyrR9sxAEwaxxhlXfR3aKUmkVMs41Dc'
});



const cluster = require('cluster');



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
	fnCruce('bin', bids, 'BTCUSDT_', 'sell');
});




binance.websockets.depthCache(["NEOBTC"], function(symbol, depth) {
	let max = 10; // Show 10 closest orders only
	let bids = binance.sortBids(depth.bids, max);
	let asks = binance.sortAsks(depth.asks, max);
	/*console.log(symbol+" depth cache update");
	console.log("asks", asks);
	console.log("bids", bids);
	console.log("ask: "+binance.first(asks));
	console.log("bid: "+binance.first(bids));*/
	fnCruce('bin', asks, 'NEOBTC', 'buy');
	fnCruce('bin', bids, 'NEOBTC_', 'sell');
});

binance.websockets.depthCache(["NEOUSDT"], function(symbol, depth) {
	let max = 10; // Show 10 closest orders only
	let bids = binance.sortBids(depth.bids, max);
	let asks = binance.sortAsks(depth.asks, max);
	/*console.log(symbol+" depth cache update");
	console.log("asks", asks);
	console.log("bids", bids);
	console.log("ask: "+binance.first(asks));
	console.log("bid: "+binance.first(bids));*/
	fnCruce('bin', bids, 'NEOUSDT', 'sell');
	fnCruce('bin', asks, 'NEOUSDT_', 'buy');
});






var fsLauncher = require('fs');

var validacionDatos = {};
var sw = false;
var acum = 0;
var acum2 = 0;
var countOrd = 0;

function fnCruce(orig, data, currencyPair, op){
	if(!validacionDatos[currencyPair]){
		validacionDatos[currencyPair] = {};
		validacionDatos[currencyPair].op = op;	
	} 
	
	validacionDatos[currencyPair].data = data;
	//console.log(currencyPair);
	if(validacionDatos['BTCUSDT'] && validacionDatos['NEOBTC'] && validacionDatos['NEOUSDT']
	&& validacionDatos['BTCUSDT_'] && validacionDatos['NEOUSDT_'] && validacionDatos['NEOBTC_']
	&& countOrd == 0){
		console.log("ORDER: " + countOrd);
		var qty1 = 11.9 / binance.first(validacionDatos['BTCUSDT'].data);
		qty1 = Number(qty1.toFixed(6))
		var px1 = binance.first(validacionDatos['BTCUSDT'].data);
		var amount1 = qty1 * px1 * (1 - 0.001 / 0.999);
		//console.log(binance.first(validacionDatos['BTCUSDT_'].data));
		console.log("px: " + px1 + ", qty: " + qty1 + ", amount: " + amount1);
		var qty2 = qty1 * (1 - 0.001 / 0.999) / binance.first(validacionDatos['NEOBTC'].data);//lowestAsk;
		qty2 = Number(qty2.toFixed(2))
		var px2 = binance.first(validacionDatos['NEOBTC'].data);//lowestAsk;
		var amount2 = qty2 * px2 * (1 - 0.001 / 0.999);
		console.log("px: " + px2 + ", qty: " + qty2 + ", amount: " + amount2);
		
		
		var qty3 = qty2 * (1 - 0.001 / 0.999);// * binance.first(validacionDatos['NEOBTC_'].data);
		qty3 = Number(qty3.toFixed(3));
		var px3 = binance.first(validacionDatos['NEOUSDT'].data);
		var amount3 = qty3 * px3 * (1 - 0.001 / 0.999);
		console.log("px: " + px3 + ", qty: " + qty3 + ", amount: " + amount3);
		var result = amount3;
		console.log(result);
		result = result - 11.9;
		console.log("RES: " + ((qty1 * px1) - amount3));
		
		
		
		
		
		
		
		
		var qty4 = 11.9 / binance.first(validacionDatos['BTCUSDT_'].data)
		qty4 = Number(qty4.toFixed(6));
		var px4 = binance.first(validacionDatos['BTCUSDT_'].data);
		var amount4 = qty4 * px4 * (1 - 0.001 / 0.999);
		//console.log(binance.first(validacionDatos['BTCUSDT_'].data));
		console.log("px: " + px4 + ", qty: " + qty4 + ", amount: " + amount4);
		var qty5 = amount4 / binance.first(validacionDatos['NEOUSDT_'].data);//lowestAsk;
		qty5 = Number(qty5.toFixed(3));	
		var px5 = binance.first(validacionDatos['NEOUSDT_'].data);//lowestAsk;
		var amount5 = qty5 * px5 * (1 - 0.001 / 0.999);
		console.log("px: " + px5 + ", qty: " + qty5 + ", amount: " + amount5);
		var qty6 = qty5 * (1 - 0.001 / 0.999);// * binance.first(validacionDatos['NEOBTC_'].data);
		qty6 = Number(qty6.toFixed(2));
		var px6 = binance.first(validacionDatos['NEOBTC_'].data);
		var amount6 = qty6 * px6 * (1 - 0.001 / 0.999);
		console.log("px: " + px6 + ", qty: " + qty6 + ", amount: " + amount6);
		var result2 = amount6;
		console.log(result2);
		result2 = result2 - qty4;
		console.log("RES2: " + ((qty4) - amount6));
		
		if(result > 0.00001){
			
			console.log('\u0007');
			console.log('qty1: ' + qty1);
			binance.buy("BTCUSDT", qty1, px1, {type:'LIMIT'}, (error, response) => {
				countOrd++;
			  console.log("Limit Buy response", response);
			  console.log("order id: " + response.orderId);
			  if(error && error.body){
				console.log(error.body);
				fsLauncher.appendFileSync('./bin2.txt', 'BTCUSDT\n' + JSON.stringify(error.body) + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});  
			  }
			  
			  if(countOrd == 3){
				  countOrd = 0;
			  }
			  console.log("ORDER: " + countOrd);
			});
			
			console.log('qty2: ' + qty2);
			binance.buy("NEOBTC", qty2, px2, {type:'LIMIT'}, (error, response) => {
				countOrd++;
			  console.log("Limit Buy response", response);
			  console.log("order id: " + response.orderId);
			  if(error && error.body){
				console.log(error.body);
				fsLauncher.appendFileSync('./bin2.txt', 'NEOBTC\n' + JSON.stringify(error.body) + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});  
			  }
			  if(countOrd == 3){
				  countOrd = 0;
			  }
			  console.log("ORDER: " + countOrd);
			});
			
			console.log('qty3: ' + qty3);
			binance.sell("NEOUSDT", qty3, px3, {type:'LIMIT'}, (error, response) => {
				countOrd++;
			  console.log("Limit Buy response", response);
			  console.log("order id: " + response.orderId);
			  if(error && error.body){
				console.log(error.body);
				fsLauncher.appendFileSync('./bin2.txt', 'NEOUSDT\n' + JSON.stringify(error.body) + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});  
			  }
			  if(countOrd == 3){
				  countOrd = 0;
			  }
			  console.log("ORDER: " + countOrd);
			});
		}
		
		
		if(result2 > 0.00001){
			
			console.log('\u0007');
			binance.sell("BTCUSDT", qty4, px4, {type:'LIMIT'}, (error, response) => {
			  countOrd++;
			  console.log("Limit Buy response", response);
			  console.log("order id: " + response.orderId);
			  if(error && error.body){
				console.log(error.body);
				fsLauncher.appendFileSync('./bin2.txt', 'BTCUSDT\n' + JSON.stringify(error.body) + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});  
			  }
			  if(countOrd == 3){
				  countOrd = 0;
			  }
			  console.log("ORDER: " + countOrd);
			});
			
			
			binance.buy("NEOUSDT", qty5, px5, {type:'LIMIT'}, (error, response) => {
			  countOrd++;
			  console.log("Limit Buy response", response);
			  console.log("order id: " + response.orderId);
			 if(error && error.body){
				console.log(error.body);
				fsLauncher.appendFileSync('./bin2.txt', 'NEOUSDT\n' + JSON.stringify(error.body) + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});  
			  }
			  if(countOrd == 3){
				  countOrd = 0;
			  }
			  console.log("ORDER: " + countOrd);
			});
			
			
			binance.sell("NEOBTC", qty6, px6, {type:'LIMIT'}, (error, response) => {
			  countOrd++;	
			  console.log("Limit Buy response", response);
			  console.log("order id: " + response.orderId);
			  if(error && error.body){
				console.log(error.body);
				fsLauncher.appendFileSync('./bin2.txt', 'NEOBTC\n' + JSON.stringify(error.body) + " \n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});  
			  }
			  if(countOrd == 3){
				  countOrd = 0;
			  }
			  console.log("ORDER: " + countOrd);
			});
		}
		
		
	
		if(((result > 0 ) || (result2 > 0 )) && !sw){
			console.log("*********************************************");
			sw = true;
			acum += Number(result) > 0 ? Number(result) : 0;
			acum2 += Number(result2) > 0 ? Number(result2) : 0;
			
			fsLauncher.appendFileSync('./bin2.txt', " [ " + (acum) + " :: " + (acum2) + " ]\n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});
		}
		if(result < 0 && sw){
			console.log("*********************************************");
			sw = false;
		}
		console.log("[ " + result + " :: " + result2 + " ]");
		
	}
}

