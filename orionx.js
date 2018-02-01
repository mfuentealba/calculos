const cluster = require('cluster');

var EventEmitter = require('events').EventEmitter;
//var cache = require('memory-cache');
var ee = new EventEmitter();

//ee.on('8', fnExecRpt);
/*ee.on('3', fnExecRpt);
ee.on('9', fnExecRpt);*/





process.on('message', (msg) => {
	console.log('inicio Proceso');
	process.send({ cmd: 'inicio Proceso', data: process.pid });
	console.log(msg + ' ' + process.pid);
  const JSSHA = require('jssha');
  const fetch = require('node-fetch');
  
  // Creating SHA-OBJ
  const shaObj = new JSSHA('SHA-512', 'TEXT');
  
  /**
   * FullQuery() execs queries to an url with a query body, apiKey and secretKey.
   * @param {String} url Url of the Orionx.io API GraphQL
   * @param {String} query GraphQL Query
   * @param {String} apiKey Personal Api Key from Orionx.io
   * @param {String} apiSecretKey Personal Secret Api Key from Orionx.io
   * @return {Object} JS object
   */
  async function fullQuery(url, query, apiKey, apiSecretKey) {
    // New actual Time-Stamp
    let timeStamp = new Date().getTime() / 1000;
  
    // Operating info of shaObj
    shaObj.setHMACKey(apiSecretKey, 'TEXT');
    let body = JSON.stringify(query);
    shaObj.update(timeStamp + body);
    let signature = shaObj.getHMAC('HEX');
  
    // Sending request
    try {
      let res = await fetch(url, {            // Consulta tipo POST.
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ORIONX-TIMESTAMP': timeStamp,
          'X-ORIONX-APIKEY': apiKey,
          'X-ORIONX-SIGNATURE': signature,
          'Content-Length': body.length,
        },
        body,                                 // Cuerpo del Mensaje (query)
      });
      return res.json();
    } catch (e) {
      throw(e);
    }
  }
  
  /**
   * main() prints the result of a GraphQL query to Orionx.io
   * @param {String} query GraphQL query string
   */
  async function main(query, marketCode) {
    try {
      let res = await fullQuery(
        'http://api2.orionx.io/graphql',   // Dirección de la API de Orionx
        query,                            // query creada
        'xot4eDxZLWyjvbA4MJAYy55mDQ5FRc8zuX',                      // Aquí va la API Key
        'RHA5QN6RurArY2cXEntp43YXr5Kyz6y65a'                // Aquí va la Secret API Key
      );
  
     /* console.log('*** Response ***');    // Se imprime la respuesta que llega
      console.log(res.data);*/
      //return(res.data);
      console.log(marketCode);
      if(marketCode != ""){
		console.log("-------" + marketCode);  
        if(marketCode.split("/")[1] == "BTC"){
          for(let obj of res.data.marketTradeHistory){
            obj.amount = obj.amount / 100000000;
            obj.price /= 100000000;                     
          }         
        } else {
          for(let obj of res.data.marketTradeHistory){
            obj.amount = obj.amount / 100000000;                       
          }          
        }       
      }

      

	  var j = { cmd: 'fin proceso', data: process.pid, info: res.data, market: marketCode}
	  
      process.send(j);
      process.exit();
  
    } catch (e) {
		console.log("ERROR");
      throw(e);
    }
  }
  
  /* Basic GrapghQL Query */
  let query = {                        
      query: msg.query};
  
  
 main(query, msg.market).catch(e => {console.log(e)})
		
	});


	/*fs.watch("FIX.4.4-TOMADOR_DE_ORDENES-ORDERROUTER.messages_20170804.log", { encoding: 'utf8' }, (eventType, filename) => {
	  if (filename) {
		console.log(eventType);
		
	  }
	});*/
	

process.send({ cmd: process.pid });

















// Código creado por AAPABLAZA con base en código de Orionx.io
