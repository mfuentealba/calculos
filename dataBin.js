'use strict'

const binance = require('node-binance-api');
const Binance = require('binance-api-node').default
var EventEmitter = require('events').EventEmitter;
var ee = new EventEmitter();
var moment = require('moment');
var dateFormat = require('dateformat');
var fs = require('fs');
//ee.on("exec", fnAsignar);

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



console.log(moment(new Date()).format('YYYY-MM-DD'));



 
// Authenticated client, can make signed calls
const client = Binance({
  apiKey: 'tfdrBVQrUdxkvRLDaMA6HnmTSNMBSlZcnDkPDLdjOGdecEJaVYxDZFugmzH5H1wb',
  apiSecret: '0sxAG7s1t9YHxCBFJ91NiKyC1CKpZiA4rYyrR9sxAEwaxxhlXfR3aKUmkVMs41Dc',
})
 
client.time().then(time => console.log(time))

setInterval(fn, 3000);

var i = 1
async function fn(){
	var arr = await client.aggTrades({ symbol: 'LTCBTC', fromId: i});
	var ev = '';
	for(let obj of arr){
		obj.time = new Date(obj.timestamp);
		//if(!obj.isBuyerMaker){
			//console.log(obj);		
			fs.appendFileSync('./LTCBTC/data_LTCBTC' + moment(obj.time).format('YYYY-MM-DD') + '.txt', JSON.stringify(obj) + "\n", (err) => {
				if (err) throw err;
				console.log('The "data to append" was appended to file!');
			  });
		//}
		
	}
	i += 500
}
