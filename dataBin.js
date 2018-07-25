'use strict'

const binance = require('node-binance-api');
const Binance = require('binance-api-node').default
var moment = require('moment');
var dateFormat = require('dateformat');
//10167  12672   531718-5

binance.options({
  'APIKEY':'tfdrBVQrUdxkvRLDaMA6HnmTSNMBSlZcnDkPDLdjOGdecEJaVYxDZFugmzH5H1wb',
  'APISECRET':'0sxAG7s1t9YHxCBFJ91NiKyC1CKpZiA4rYyrR9sxAEwaxxhlXfR3aKUmkVMs41Dc',
  useServerTime: true,
  log: log => {
    console.log(log); // You can create your own logger here, or disable console output
  }
});
/*
binance.websockets.chart("BNBBTC", "1m", (symbol, interval, chart) => {
  let tick = binance.last(chart);
  const last = chart[tick].close;
  console.log(chart);
  // Optionally convert 'chart' object to array:
  // let ohlc = binance.ohlc(chart);
  // console.log(symbol, ohlc);
  console.log(symbol+" last price: "+last)
});*/




 
// Authenticated client, can make signed calls
const client = Binance({
  apiKey: 'tfdrBVQrUdxkvRLDaMA6HnmTSNMBSlZcnDkPDLdjOGdecEJaVYxDZFugmzH5H1wb',
  apiSecret: '0sxAG7s1t9YHxCBFJ91NiKyC1CKpZiA4rYyrR9sxAEwaxxhlXfR3aKUmkVMs41Dc',
})
 
client.time().then(time => console.log(time))


fn();

async function fn(){
	var arr = await client.aggTrades({ symbol: 'ETHBTC', fromId: 501});
	for(let obj of arr){
		obj.time = new Date(obj.timestamp);
		//if(!obj.isBuyerMaker){
			console.log(obj);		
		//}
		
	}
	
}
