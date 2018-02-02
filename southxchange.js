/**
 * Clave: uUVmpIxtbxJWMrNOrOBkXXWKPXnJdh

Secreto: tTiQAtoIJRAttGNbFBElwrCUmvdrwqBoPSjvucrYGJFJJkjPWU
 */

//P5Kc7UjcwjTHe8bg6dT9yr1g3kvVj1sw74ogyYHdst7z5h7cNfEP
const cluster = require('cluster');

process.on('message', (msg) => {
	console.log('inicio Proceso');
	
	try {

	  // URLs para consulta y formación de links
	  var URL_BASE = 'https://www.southxchange.com/api/';
	  
	  var URL_LINK = URL_BASE + msg.url;

	  
		
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
			  
			var data = JSON.parse(cancionesJSON); 
			process.send({ cmd: 'fin proceso', data: process.pid, info: data});

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
		
});


	

process.send({ cmd: process.pid });







