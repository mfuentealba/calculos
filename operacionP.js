const cluster = require('cluster');
const Poloniex = require('poloniex-api-node');
let poloniex = new Poloniex('Z3QXH3L0-AR8VP0ZA-PTR8VH8C-PBQO5LQU', '23b36c259b7a1af19dbf3b4bd444fd19e182637abd14fb62d1d784a711898939295b2fd96665a586c0d604f3296ba74731c029cddc6fb6d73b76a2b9f8744194');

var contBooks = 0;
process.on('message', (msg) => {
	
	//console.log(msg);
	
	poloniex.subscribe(msg[0]);
	poloniex.subscribe(msg[1]);
	poloniex.subscribe(msg[2]);
	var books = {};
	var ganancia = 0;
	poloniex.on('message', (channelName, data, seq) => {	 
		
		//console.log(data);
		//console.log("*******************************************************************************");		
		for(var obj of data){

			switch(obj.type){
				case "orderBook":
					books[channelName] = {};
					books[channelName]["asks"] = obj.data.asks;
					books[channelName]["bids"] = obj.data.bids;
					console.log("********************************* " + channelName + " **********************************************");
					var i = 0;
					var libro;
					if(channelName == msg[0]){
						libro = "asks";
					} else {
						
						libro = "bids";
					}
					for(let reg in books[channelName][libro]){
						console.log('rate: ' + reg + ', vol: ' + books[channelName][libro][reg]);
						if(i++ > 10){
							break;
						}
					}
						
					contBooks++;
					if(contBooks == 3){
						var operacion;
						var volOperacion;
						var volTransada;
						var precioTransada;
						var volReferencia;
						var precioReferencia;
						
						
						for(let reg in books[msg[0]]["asks"]){
							volReferencia = books[msg[0]]["asks"][reg];
							precioReferencia = reg;
							break;
						}
						
						for(let reg in books[msg[1]]["bids"]){
							
							volOperacion = books[msg[1]]["bids"][reg];
							precioOperacion = reg;
							break;
						}
						
						
						for(let reg in books[msg[2]]["bids"]){
							
							volTransada = books[msg[2]]["bids"][reg];
							precioTransada = reg;
							break;
						}
						
						
						
						var retorno = (1 - 0.0015 / 0.9985) * precioTransada * (1 - 0.0025 / 0.9975);
						console.log("Transada:  " + precioTransada);
						console.log("RETORNO:   " + retorno);	
						var gasto = precioReferencia * (1 + 0.0025 / 0.9975) * precioOperacion;
						console.log("Referencia:" + precioReferencia);
						console.log("Operacion: " + precioOperacion);
						console.log("GASTO:     " + gasto);	
						
						
						
						
						//console.log(operacion + ' < ' + volReferencia);
						if(retorno - gasto > 0){
							if(volOperacion * precioOperacion < volReferencia){//Puedo operar todo
								if(volOperacion < volTransada){ //Puedo vender Todo
									console.log("OPERACION EXITOSA 1");
									
									console.log("RESULTADO: " + ((retorno - gasto) * volOperacion));
								} else {
									console.log("OPERACION EXITOSA 2");
									
									console.log("RESULTADO: " + ((retorno - gasto) * volTransada / precioTransada ));
								}
							} else {
								
								if(volOperacion < volTransada){ //Puedo vender Todo
									console.log("OPERACION EXITOSA 3");
									
									console.log("RESULTADO: " + ((retorno - gasto) * volReferencia / precioOperacion ));
								} else {
									console.log("OPERACION EXITOSA 4");
									
									console.log("RESULTADO: " + ((retorno - gasto) * volTransada / precioTransada ));
								}
							}
							
							
						}
						
						
						console.log("*******************************************************************************");	
						
						
						
					}
					process.exit();
				break;
				case "orderBookModify":
					books[channelName][obj.data.type + 's'][obj.data.rate] = obj.data.amount;
				break;
				case "orderBookRemove":
					delete books[channelName][obj.data.type + 's'][obj.data.rate];
				break;
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
	  console.log(`An error has occured`);
	});
	 
	poloniex.openWebSocket({ version: 2 });
		
	
	
	process.send({ cmd: 'fin proceso' });
	
		
});

process.send({ cmd: process.pid });