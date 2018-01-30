var express = require('express');  
/*const Shared = require('mmap-object'); 
const shared_object = new Shared.Create('filename');*/

var EventEmitter = require('events').EventEmitter;
var ee = new EventEmitter();
ee.on(true, fnOrionx);

var d = new Date("2014.01.01:23:06");
console.log(d);
console.log(d.getTime());
var app = express();  
var server = require('http').Server(app);  
var io = require('socket.io')(server);
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;



var objLecturaLog = {};
var objLecturaLogPersistente = {};
var wk;

var arr = [];

    var objArr = {};
   

var hijos = 0;

function fnMaster(msg){
	 
    switch(msg.cmd){
        case 'inicio Proceso':
          delete objLecturaLog[msg.data];
        break;
        case 'fin proceso':
          objLecturaLog[msg.data] = objLecturaLogPersistente[msg.data];
          console.log(msg);
          arr[objArr[msg.market]]['result'] = msg.info;
          
          
          console.log("***************************");

          for(let obj of arr[objArr[msg.market]]['result'].marketOrderBook.buy){
            console.log(obj);
          }


          hijos++;
          if(hijos == arr.length * 2){
			  hijos = 0;
			  
            

              var comisionTake = (0.0029 / 0.9971) + 1;
              var comisionMake = (0.0021 / 0.9979) + 1;

              var compraChauchaBTC = arr[objArr['BTC/CLP']]['result'].marketOrderBook.sell[0].limitPrice * comisionTake * arr[objArr['CHA/BTC']]['result'].marketOrderBook.sell[0].limitPrice * comisionTake;

              console.log('CHA a mercado: ' + arr[objArr['CHA/CLP']]['result'].marketOrderBook.buy[0].limitPrice * comisionTake);
              console.log('Comprar BTC Mercado: ' + arr[objArr['BTC/CLP']]['result'].marketOrderBook.sell[0].limitPrice * comisionTake);
              console.log('CHA desde BTC a CHA Mercado: ' + compraChauchaBTC);
              console.log('GANANCIA: ' + ((arr[objArr['CHA/CLP']]['result'].marketOrderBook.buy[0].limitPrice * 0.9971) - compraChauchaBTC));

              var chauchaMejorBTC = arr[objArr['BTC/CLP']]['result'].marketOrderBook.buy[0].limitPrice * 1.01 * comisionMake * arr[objArr['CHA/BTC']]['result'].marketOrderBook.sell[0].limitPrice * comisionTake;
              console.log(arr[objArr['BTC/CLP']]['result'].marketOrderBook.buy[0].limitPrice);
              console.log(arr[objArr['CHA/BTC']]['result'].marketOrderBook.sell[0].limitPrice);
              console.log('chaMejorBTC: ' + chauchaMejorBTC);
              console.log('Comprar BTC Mejor: ' + arr[objArr['BTC/CLP']]['result'].marketOrderBook.buy[0].limitPrice * comisionMake * 1.01);
              console.log('GANANCIA: ' + ((arr[objArr['CHA/CLP']]['result'].marketOrderBook.buy[0].limitPrice * 0.9971) - chauchaMejorBTC));

              var chauchaMejorCHABTC = arr[objArr['BTC/CLP']]['result'].marketOrderBook.buy[0].limitPrice * comisionMake * 1.01 * arr[objArr['CHA/BTC']]['result'].marketOrderBook.buy[0].limitPrice * comisionMake * 1.01;
              
              console.log('chaMejorCHABTC: ' + chauchaMejorCHABTC);
              console.log('GANANCIA: ' + ((arr[objArr['CHA/CLP']]['result'].marketOrderBook.buy[0].limitPrice * 0.9971) - chauchaMejorCHABTC));

              var chauchaMejorCHACLP = arr[objArr['BTC/CLP']]['result'].marketOrderBook.buy[0].limitPrice * comisionMake * 1.01 * arr[objArr['CHA/BTC']]['result'].marketOrderBook.buy[0].limitPrice * 1.01 * comisionMake;
              console.log('CHA a limit: ' + arr[objArr['CHA/CLP']]['result'].marketOrderBook.sell[0].limitPrice * comisionMake * 1.01);
              console.log('CHA desde BTC a CHA todo Limit: ' + chauchaMejorCHACLP);
              console.log('GANANCIA: ' + ((arr[objArr['CHA/CLP']]['result'].marketOrderBook.sell[0].limitPrice * 0.9971 * 0.99) - chauchaMejorCHACLP));





            console.log("COMPRAR MAXIMO BTC A: " + (arr[objArr['CHA/BTC']]['result'].marketOrderBook.buy[0].limitPrice * comisionMake * 1.01) +  " BTC")

            console.log("********************  Southxchange BTC ********************");


            var comisionSouth = ((0.002  /0.998) + 1) * 1.01;


            compraChauchaBTC = arr[objArr['BTC/CLP']]['result'].marketOrderBook.sell[0].limitPrice * comisionTake * objSouth['CHA/BTC'].SellOrders[0].Price * comisionSouth * 1.0001;
            
            console.log('CHA a mercado: ' + objSouth['CHA/BTC'].SellOrders[0].Price * comisionSouth);
            console.log('Comprar BTC Mercado: ' + (arr[objArr['BTC/CLP']]['result'].marketOrderBook.sell[0].limitPrice * comisionTake));
            console.log('CHA desde BTC a CHA Mercado: ' + compraChauchaBTC);
            console.log('GANANCIA: ' + ((arr[objArr['CHA/CLP']]['result'].marketOrderBook.buy[0].limitPrice * 0.9971 * 0.9999 * 0.99) - compraChauchaBTC));

            var chauchaMejorBTC = arr[objArr['BTC/CLP']]['result'].marketOrderBook.buy[0].limitPrice * 1.01 * comisionMake * objSouth['CHA/BTC'].SellOrders[0].Price * comisionSouth * 1.0001;
            


            console.log('chaMejorBTC: ' + chauchaMejorBTC);
            console.log('Comprar BTC Mejor: ' + arr[objArr['BTC/CLP']]['result'].marketOrderBook.buy[0].limitPrice * comisionMake * 1.01);
            console.log('GANANCIA: ' + ((arr[objArr['CHA/CLP']]['result'].marketOrderBook.buy[0].limitPrice * 0.9971 * 0.9999) - chauchaMejorBTC));

            var chauchaMejorCHA = (arr[objArr['BTC/CLP']]['result'].marketOrderBook.sell[0].limitPrice * comisionTake) * objSouth['CHA/BTC'].BuyOrders[0].Price * comisionSouth * 1.0101;
            
            console.log('MejorCHA: ' + chauchaMejorCHA);
            console.log('GANANCIA: ' + ((arr[objArr['CHA/CLP']]['result'].marketOrderBook.buy[0].limitPrice * 0.9971 * 0.9999) - chauchaMejorCHA));



            var chauchaMejorCHABTC = arr[objArr['BTC/CLP']]['result'].marketOrderBook.buy[0].limitPrice * 1.01 * comisionMake * objSouth['CHA/BTC'].BuyOrders[0].Price * comisionSouth * 1.0101;
            
            console.log('chaMejorCHABTC: ' + chauchaMejorCHABTC);
            console.log('GANANCIA: ' + ((arr[objArr['CHA/CLP']]['result'].marketOrderBook.buy[0].limitPrice * 0.9971 * 0.9999) - chauchaMejorCHABTC));

            var chauchaMejorCHACLP = arr[objArr['BTC/CLP']]['result'].marketOrderBook.buy[0].limitPrice * 1.01 * comisionMake * objSouth['CHA/BTC'].BuyOrders[0].Price * comisionSouth * 1.0101;
            console.log('CHA a limit: ' + arr[objArr['CHA/CLP']]['result'].marketOrderBook.sell[0].limitPrice * comisionMake * 1.0101);
            console.log('CHA desde BTC a CHA todo Limit: ' + chauchaMejorCHACLP);
            console.log('GANANCIA: ' + ((arr[objArr['CHA/CLP']]['result'].marketOrderBook.sell[0].limitPrice * 0.9979 * 0.9999) - chauchaMejorCHACLP));
            
            
            
            
            
            console.log("COMPRAR MAXIMO BTC A: " + (objSouth['CHA/BTC'].BuyOrders[0].Price * 100.0121) +  " BTC")
            





            
            console.log("********************  Southxchange  BCH ********************");

            compraChauchaBTC = arr[objArr['BCH/CLP']]['result'].marketOrderBook.sell[0].limitPrice * objSouth['CHA/BCH'].SellOrders[0].Price;
            
            console.log('CHAUCHA a mercado: ' + arr[objArr['CHA/CLP']]['result'].marketOrderBook.buy[0].limitPrice);
            console.log('CHAUCHA desde BCH a Mercado: ' + compraChauchaBTC);
            console.log('GANANCIA: ' + (arr[objArr['CHA/CLP']]['result'].marketOrderBook.buy[0].limitPrice - compraChauchaBTC));


            var chauchaMejorBTC = (arr[objArr['BCH/CLP']]['result'].marketOrderBook.buy[0].limitPrice + arr[objArr['BCH/CLP']]['result'].marketOrderBook.buy[0].limitPrice * 0.01) * objSouth['CHA/BCH'].SellOrders[0].Price;
            console.log('CHAUCHA a mercado: ' + arr[objArr['CHA/CLP']]['result'].marketOrderBook.buy[0].limitPrice);
            console.log('chauchaMejorBCH: ' + chauchaMejorBTC);
            console.log('GANANCIA: ' + (arr[objArr['CHA/CLP']]['result'].marketOrderBook.buy[0].limitPrice - chauchaMejorBTC));

            var chauchaMejorCHABTC = (arr[objArr['BCH/CLP']]['result'].marketOrderBook.buy[0].limitPrice + arr[objArr['BCH/CLP']]['result'].marketOrderBook.buy[0].limitPrice * 0.01) * (objSouth['CHA/BCH'].BuyOrders[0].Price + objSouth['CHA/BCH'].BuyOrders[0].Price * 0.01);
            console.log('CHAUCHA a mercado: ' + arr[objArr['CHA/CLP']]['result'].marketOrderBook.buy[0].limitPrice);
            console.log('chauchaMejorCHABCH: ' + chauchaMejorCHABTC);
            console.log('GANANCIA: ' + (arr[objArr['CHA/CLP']]['result'].marketOrderBook.buy[0].limitPrice - chauchaMejorCHABTC));

            var chauchaMejorCHACLP = (arr[objArr['BCH/CLP']]['result'].marketOrderBook.buy[0].limitPrice + arr[objArr['BCH/CLP']]['result'].marketOrderBook.buy[0].limitPrice * 0.01) * (objSouth['CHA/BCH'].BuyOrders[0].Price + objSouth['CHA/BCH'].BuyOrders[0].Price * 0.01);
            console.log('CHAUCHA a limit: ' + arr[objArr['CHA/CLP']]['result'].marketOrderBook.sell[0].limitPrice);
            console.log('CHAUCHA desde BCH a Mercado: ' + chauchaMejorCHACLP);
            console.log('GANANCIA: ' + (arr[objArr['CHA/CLP']]['result'].marketOrderBook.sell[0].limitPrice - chauchaMejorCHACLP));

            console.log("COMPRAR MAXIMO BCH A: " + (objSouth['CHA/BCH'].BuyOrders[0].Price * 100.01) +  " BCH")
            


			  /*for(let obj of arr){
                obj.result
              }*/
        }


        break;
        case 'fix':
          console.log("***************************");
          console.log(msg.data);
        break;
        case 'enviarMkdt':
          console.log("*********--enviarMkdt--***********");
          //console.log(this.socket);
          //this.socket.emit('fnAdd', msg.data);
          io.sockets.emit('fnAdd', msg.data);
        break;
        default:
            //this.send('MASTER: Listo el proceso {' + process.pid + '}');	
            this.send(arr[hijos++]);

            
        break;
    }
	
}



/**********CARGAR DATA TOMADOR********************************************************************************************************/


if (cluster.isMaster) {
	console.log(`Master ${process.pid} is running`);
  /*
	cluster.setupMaster({
	  exec: 'httpServer.js',
	  args: [],
	  silent: false
  });
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }*/
  

  cluster.setupMaster({
	  exec: 'prueba.js',
    //exec: 'tendencias.1.js',
    //exec: 'archivosConsolidados.js',
	  //exec: 'lecturaMarketData.js',
	  args: [],
	  silent: false
  });
    /*const wk = cluster.fork();
    //objLecturaLog[wk.process.pid] = wk;
    console.log(wk.process.pid);
	wk.on('message', fnMaster);//106933421
  */
  
  
  
 

console.log('Listo!!');

  cluster.on('exit', (worker, code, signal) => {
	console.log(`worker ${worker.process.pid} died`);
	//cluster.fork();
  });
} else {
  
 
}




var messages = [{  
  id: 1,
  text: "Hola soy un mensaje",
  author: "Carlos Azaustre"
}];

app.use(express.static('public'));

app.get('/hello', function(req, res) {  
  res.status(200).send("Hello World!");
});


app.get('/chart', function(req, res) {  
  res.status(200).send("Hello!");
});

io.on('connection', function(socket) {  
  console.log('Alguien se ha conectado con Sockets');
  socket.emit('messages', messages);

  socket.on('new-message', function(data) {
    messages.push(data);

    io.sockets.emit('messages', messages);
  });

  socket.on('message', function(data) {
    console.log('message');    
	
	
	fnSouth(arrSouthReq[ejecucionSouth].mkt, arrSouthReq[ejecucionSouth].url);
	
    
  });

  socket.on('contar', function(data) {
    console.log('******contar******');
    messages = [];
    var i = 0;
    for(var str in objLecturaLog){        
        console.log(str);        
        messages.push({  
        id: i++,
        text: str,
        author: "SYSTEM"
      });
    }
    

    io.sockets.emit('messages', messages);
    console.log('******FIN******');    
  });
  

});

server.listen(8888, function() {  
  console.log("Servidor corriendo en http://localhost:8888");
});


var objSouth = {};
var arrSouthReq = [{mkt: 'CHA/BTC', url: 'CHA/BTC'}, {mkt: 'CHA/BCH', url: 'CHA/BCH'}];
var ejecucionSouth = 0;

function fnMercados(msg){
    
    switch(msg.cmd){
        case 'inicio Proceso':
          
        break;
        case 'fin proceso':
          
            for(var obj of msg.info.markets){
                console.log(obj);
                objArr[obj.name] = arr.length;
                arr[arr.length] = {market: obj.name, query: `query{
                    marketOrderBook(marketCode:"` + obj.code + `",limit:3) {
                    buy {
                        amount
                        limitPrice
                        accumulated
                        accumulatedPrice
                    }
                    sell {
                        amount
                        limitPrice
                        accumulated
                        accumulatedPrice
                    }
                    spread
                    mid
                    }
                }
                `};
                
               
            }

            for(var obj of arr){
                wk = cluster.fork();
                wk.socket = this;
                objLecturaLogPersistente[wk.process.pid] = wk;
                wk.on('message', fnMaster);
            }

        break;
       
        default:
        var obj = {market: '', query: `query{
            markets {
              code
              name
              commission
              releaseDate
            }
          }
        `}
            this.send(obj);

            
        break;
    }

}

function fnOrionx(){

    wk = cluster.fork();
    wk.socket = this;
    objLecturaLogPersistente[wk.process.pid] = wk;
    wk.on('message', fnMercados);


}


function fnSouth(codMarket, URLMarket){
try {

	  // URLs para consulta y formación de links
	  var URL_BASE = 'https://www.southxchange.com/api/book/';
	  
	  var URL_LINK = URL_BASE + URLMarket;

	  
		
		// Realiza la petición
		var http = require('https');
		console.log(URL_LINK);
		var peticion = http.get(URL_LINK, function(respuesta) {
		
		  
		  var cancionesJSON = '';
		  respuesta.on('data', function(respuestaJSON) {
			cancionesJSON += respuestaJSON;
		  });

		  // Una vez finalizada la respuesta se procesa
		  respuesta.on('end', function() {

			var canciones = JSON.parse(cancionesJSON);
			objSouth[codMarket] = canciones;
			
			console.log(objSouth[codMarket]);//objSouth			
			ejecucionSouth++;
			if(ejecucionSouth == arrSouthReq.length){
				ejecucionSouth = 0;
				fnOrionx();//ee.emit(h['35'], h);	
			} else {
				fnSouth(arrSouthReq[ejecucionSouth].mkt, arrSouthReq[ejecucionSouth].url);
			}
			
		  });

		}).on('error', function(error) {
		  // Ocurrió un error en el request
		  console.log('Error encontrado al realizar la consulta: ' + error.message);
		});

	  
	}
	  catch(err) {
	  console.log('Error inesperado:');
	  console.log('\t' + err);
	}	
	
}


	
	
	
	
	
	
	
	
	