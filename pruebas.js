const binance = require('node-binance-api');
binance.options({
  'APIKEY':'tfdrBVQrUdxkvRLDaMA6HnmTSNMBSlZcnDkPDLdjOGdecEJaVYxDZFugmzH5H1wb',
  'APISECRET':'0sxAG7s1t9YHxCBFJ91NiKyC1CKpZiA4rYyrR9sxAEwaxxhlXfR3aKUmkVMs41Dc'
});

/*
binance.websockets.depthCache(['BNBBTC'], (symbol, depth) => {
  let bids = binance.sortBids(depth.bids);
  let asks = binance.sortAsks(depth.asks);
  console.log(symbol+" depth cache update");
  console.log("bids", bids);
  console.log("asks", asks);
  console.log("best bid: "+binance.first(bids));
  console.log("best ask: "+binance.first(asks));
});
*/


var quantity = 2.34, price = 1;
binance.sell("BNBBTC", quantity, price, {type:'LIMIT'}, (error, response) => {
  console.log("Limit Buy response", response);
  console.log("order id: " + response.orderId);
  binance.cancel(response.symbol, response.orderId, (error, response, symbol) => {
				  console.log(symbol+" cancel response:", response);
				});
  //console.log(error.body);
});

/*var quantity = 10;
binance.marketBuy("BNBBTC", quantity, (error, response) => {
  console.log("Limit Buy response", response);
  console.log("order id: " + response.orderId);
 // console.log(error);
});*/
//binance.marketSell("ETHBTC", quantity);