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
					for(let reg in books[channelName]["asks"]){
						console.log('rate: ' + reg + ', vol: ' + books[channelName]["asks"][reg]);
						if(i++ > 10){
							break;
						}
					}
						
					contBooks++;
					if(contBooks == 3){
						var posible;
						var volPosible;
						var valorOpcion;
						var precioOpcion;
						var valorReferencia;
						var precioReferencia;
						
						
						for(let reg in books[msg[0]]["asks"]){
							valorReferencia = books[msg[1]]["asks"][reg];
							precioReferencia = reg;
							break;
						}
						
						for(let reg in books[msg[1]]["asks"]){
							
							posible = reg * books[msg[0]]["asks"][reg];
							volPosible = books[msg[0]]["asks"][reg];
							break;
						}
						
						
						for(let reg in books[msg[2]]["bids"]){
							
							valorOpcion = books[msg[2]]["bids"][reg];
							precioOpcion = reg;
							break;
						}
						
						
						
						
						if(posible < valorReferencia){//Puedo operar todo
							if(volPosible < valorOpcion){ //Puedo vender Todo
								console.log("OPERACION EXITOSA");
								var gasto = posible * precioReferencia;
								var retorno = precioReferencia * 
								
							}
						} else {
							valorReferencia
						}
						
						console.log("*******************************************************************************");	
						
						
						
					}
					
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