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

/*function* gen() 
{ 
	var a=0,b=undefined,c=0; 
	
	while(a<20)
	{ 
		if(b!=undefined) 
		{ 
			a=b; // resetea la variuable "a" para que empiece desde el valor indicado como parametro en yield
			c++; // suma un reset mas a la cantidad total hasta ahora
		} 
		b=yield a+','+c; // retorna el valor de "a" concatenado con "c" y en el siguiente next()recibe un valor para "b"
		a++; 
	} 
	return 'yield terminados. Esto es el return.';
} 

var secuencia = gen();

console.log(secuencia.next()); // Object { value="0,0",  done=false}
console.log(secuencia.next()); // Object { value="1,0",  done=false}
console.log(secuencia.next()); // Object { value="2,0",  done=false}
console.log(secuencia.next(10)); // Object { value="10,1",  done=false} 
console.log(secuencia.next()); // Object { value="11,1",  done=false}
console.log(secuencia.next()); // Object { value="12,1",  done=false}
console.log(secuencia.next(5)); // Object { value="5,2",  done=false} 
console.log(secuencia.next()); // Object { value="6,2",  done=false}
console.log(secuencia.next(19)); // Object { value="19,3",  done=false} 
console.log(secuencia.next()); // Object { value="20,3",  done=false}
console.log(secuencia.next()); // Object { value="yield terminados. Esto es el return.",  done=true}
*/


function *crearGenerador() {
    let primero = yield 1;
    let segundo = yield primero + 2;       // 4 + 2
    yield segundo + 3;                   // 5 + 3
}

let generador = crearGenerador();

console.log(generador.next());           // "{ value: 1, done: false }"
console.log(generador.next(4));          // "{ value: 6, done: false }"
console.log(generador.next(5));          // "{ value: 8, done: false }"
console.log(generador.next());           // "{ value: undefined, done: true }"+

var BufferClass = function(){
	
	console.log(this.x)
}

BufferClass.prototype.x = 2;


/*var h = new BufferClass();
console.log(h.x);
*/

var objLecturaLog = {};
var objLecturaLogPersistente = {};
var wk;

var arr = [
     {market: 'CHACLP', query: `query{
        marketOrderBook(marketCode:"CHACLP",limit:3) {
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
  `},
  {market: 'CHABTC', query: `query{
    marketOrderBook(marketCode:"CHABTC",limit:3) {
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
`},
{market: 'BTCCLP', query: `query{
    marketOrderBook(marketCode:"BTCCLP",limit:3) {
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
`},
    ];

    var objArr = {};
    objArr['CHACLP'] = 0;
    objArr['CHABTC'] = 1;
    objArr['BTCCLP'] = 2;

var hijos = 0;

function fnMaster(msg){
	 // console.log(msg);
    //console.log(process.pid);
    switch(msg.cmd){
        case 'inicio Proceso':
          delete objLecturaLog[msg.data];
        break;
        case 'fin proceso':
          objLecturaLog[msg.data] = objLecturaLogPersistente[msg.data];
          console.log(msg);
          arr[objArr[msg.market]]['result'] = msg.info;
          //console.log(arr[objArr[msg.market]]['result']);
          
          console.log("***************************");
          hijos++;
          if(hijos == arr.length * 2){
			  hijos = 0;
			  
            //console.log(arr); 
            //console.log(arr[objArr['CHABTC']]['result']);
            for(let obj of arr[objArr['CHABTC']]['result'].marketOrderBook.buy){
                obj.amount = obj.amount / 100000000;
                obj.limitPrice /= 100000000;
                obj.accumulated /= 100000000; 
             //   console.log(obj);
              }

              for(let obj of arr[objArr['CHABTC']]['result'].marketOrderBook.sell){
                obj.amount /= 100000000; 
                obj.limitPrice /= 100000000; 
                obj.accumulated /= 100000000; 
              //  console.log(obj);
              }

              for(let obj of arr[objArr['BTCCLP']]['result'].marketOrderBook.buy){
                obj.amount = obj.amount / 100000000;
                //obj.limitPrice /= 100000000;
                obj.accumulated /= 100000000; 
                console.log(obj);
              }

              for(let obj of arr[objArr['BTCCLP']]['result'].marketOrderBook.sell){
                obj.amount /= 100000000; 
                //obj.limitPrice /= 100000000; 
                obj.accumulated /= 100000000; 
                console.log(obj);
              }

              var compraChauchaBTC = arr[objArr['BTCCLP']]['result'].marketOrderBook.sell[0].limitPrice * arr[objArr['CHABTC']]['result'].marketOrderBook.sell[0].limitPrice;

              console.log('CHAUCHA a mercado: ' + arr[objArr['CHACLP']]['result'].marketOrderBook.buy[0].limitPrice);
              console.log('CHAUCHA desde BTC a Mercado: ' + compraChauchaBTC);
              console.log('GANANCIA: ' + (arr[objArr['CHACLP']]['result'].marketOrderBook.buy[0].limitPrice - compraChauchaBTC));

              var chauchaMejorBTC = (arr[objArr['BTCCLP']]['result'].marketOrderBook.buy[0].limitPrice + arr[objArr['BTCCLP']]['result'].marketOrderBook.buy[0].limitPrice * 0.01) * arr[objArr['CHABTC']]['result'].marketOrderBook.sell[0].limitPrice;
              console.log('CHAUCHA a mercado: ' + arr[objArr['CHACLP']]['result'].marketOrderBook.buy[0].limitPrice);
              console.log('chauchaMejorBTC: ' + chauchaMejorBTC);
              console.log('GANANCIA: ' + (arr[objArr['CHACLP']]['result'].marketOrderBook.buy[0].limitPrice - chauchaMejorBTC));

              var chauchaMejorCHABTC = (arr[objArr['BTCCLP']]['result'].marketOrderBook.buy[0].limitPrice + arr[objArr['BTCCLP']]['result'].marketOrderBook.buy[0].limitPrice * 0.01) * (arr[objArr['CHABTC']]['result'].marketOrderBook.buy[0].limitPrice + arr[objArr['CHABTC']]['result'].marketOrderBook.buy[0].limitPrice * 0.01);
              console.log('CHAUCHA a mercado: ' + arr[objArr['CHACLP']]['result'].marketOrderBook.buy[0].limitPrice);
              console.log('chauchaMejorCHABTC: ' + chauchaMejorCHABTC);
              console.log('GANANCIA: ' + (arr[objArr['CHACLP']]['result'].marketOrderBook.buy[0].limitPrice - chauchaMejorCHABTC));

              var chauchaMejorCHACLP = (arr[objArr['BTCCLP']]['result'].marketOrderBook.buy[0].limitPrice + arr[objArr['BTCCLP']]['result'].marketOrderBook.buy[0].limitPrice * 0.01) * (arr[objArr['CHABTC']]['result'].marketOrderBook.buy[0].limitPrice + arr[objArr['CHABTC']]['result'].marketOrderBook.buy[0].limitPrice * 0.01);
              console.log('CHAUCHA a limit: ' + arr[objArr['CHACLP']]['result'].marketOrderBook.sell[0].limitPrice);
              console.log('CHAUCHA desde BTC a Mercado: ' + chauchaMejorCHACLP);
              console.log('GANANCIA: ' + (arr[objArr['CHACLP']]['result'].marketOrderBook.sell[0].limitPrice - chauchaMejorCHACLP));
              console.log("COMPRAR MAXIMO BTC A: " + (arr[objArr['CHABTC']]['result'].marketOrderBook.buy[0].limitPrice * 100.01) +  " BTC")

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
  
  /*process.on('message', (msg) => {
	
	console.log(msg + ' ' + process.pid);
  });
  process.send({ cmd: process.pid });
  console.log(`Worker ${process.pid} started`);*/
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
	
	
	
    
    
	/*try {

	  // URLs para consulta y formación de links
	  var URL_BASE = 'https://www.southxchange.com/api/book/';
	  var URL_REQUEST = URL_BASE + 'CHA/';
	  var URL_LINK = URL_BASE + 'BTC';

	  
		
		// Realiza la petición
		var http = require('https');
		var peticion = http.get(URL_LINK, function(respuesta) {
			
			
			//console.log(respuesta);

		  // Se asegura de que se tiene la respuesta completa (el evento data puede
		  // ser disparado en mitad de la respuesta
		  
		  
		  
		  var cancionesJSON = '';
		  respuesta.on('data', function(respuestaJSON) {
			cancionesJSON += respuestaJSON;
		  });

		  // Una vez finalizada la respuesta se procesa
		  respuesta.on('end', function() {

			var canciones = JSON.parse(cancionesJSON);

			
			  for (cancion in canciones) {
				var cancion = canciones[cancion];
				console.log('\t* ' + cancion.title + ', de ' + cancion.artist.name + ': ' + URL_LINK + cancion.id);
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
	}*/
    
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
var arrSouthReq = [{mkt: 'CHABTC', url: 'CHA/BTC'}, {mkt: 'CHABCH', url: 'CHA/BCH'}];
var ejecucionSouth = 0;

function fnOrionx(){
	wk = cluster.fork();
    wk.socket = this;
    objLecturaLogPersistente[wk.process.pid] = wk;
    wk.on('message', fnMaster);

    wk = cluster.fork();
    wk.socket = this;
    objLecturaLogPersistente[wk.process.pid] = wk;
    wk.on('message', fnMaster);

    wk = cluster.fork();
    wk.socket = this;
    objLecturaLogPersistente[wk.process.pid] = wk;
    wk.on('message', fnMaster);
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
			
			
			//console.log(respuesta);

		  // Se asegura de que se tiene la respuesta completa (el evento data puede
		  // ser disparado en mitad de la respuesta
		  
		  
		  
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


	
	
	
	
	
	
	
	
	