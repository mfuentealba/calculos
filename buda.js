/*
key        f4748dc5f158675806fcdc637058aa9f
secreto    XfQbjXEvylIhzuUWvEvv5riVL81GSl80Dex5PuVG

*/



const cluster = require('cluster');



var markets = [{nombre: 'btc-clp', code: 'BTC/CLP'}, {nombre: 'eth-clp', code: 'ETH/CLP'}, {nombre: 'bch-clp', code: 'BCH/CLP'}, 
{nombre: 'eth-btc', code: 'ETH/BTC'}, {nombre: 'bch-btc', code: 'BCH/BTC'}];
var ejecucionSouth = 0;
var objResult = {};

function fnTrades(){
	try {

	  // URLs para consulta y formación de links
	  
	  console.log(markets[ejecucionSouth].nombre);
	  var URL_LINK = 'https://www.surbtc.com/api/v2/markets/' + markets[ejecucionSouth].nombre + '/trades.json';

	  
		
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
			objResult[markets[ejecucionSouth].code].trades = canciones;
			
			console.log(markets[ejecucionSouth]);//objSouth			
			ejecucionSouth++;
			if(ejecucionSouth == markets.length){
				var j = { cmd: 'fin proceso', data: process.pid, info: objResult}
				process.send(j);
				process.exit();
				
			} else {
				fnTrades();
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



function fnSurBTCLibros(){
	try {

	  // URLs para consulta y formación de links
	 
	  
	  var URL_LINK = 'https://www.surbtc.com/api/v2/markets/' + markets[ejecucionSouth].nombre + '/order_book.json';

	  
		
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
			objResult[markets[ejecucionSouth].code] = {};
			objResult[markets[ejecucionSouth].code].libros = canciones;
			
			console.log(markets[ejecucionSouth].code);//objSouth			
			ejecucionSouth++;
			if(ejecucionSouth == markets.length){
				ejecucionSouth = 0;
				fnTrades();//ee.emit(h['35'], h);	
			} else {
				fnSurBTCLibros();
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


process.on('message', (msg) => {
	console.log('inicio Proceso');
	
	fnSurBTCLibros();	
		
});


	

process.send({ cmd: process.pid });

















// Código creado por AAPABLAZA con base en código de Orionx.io
