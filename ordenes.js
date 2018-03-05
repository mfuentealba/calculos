const poloniexOrd = require('poloniex-exchange-api');

const clientOrd = poloniexOrd.getClient({
    publicKey : 'ZSJMN2PC-CHDIRN2Q-QNEIGD5E-6IQSVNGK', // Your public key
    privateKey: '0c6a560357d29eb001438d18783a73f3428f99516011b7f5e5511082b796c83ab7be50762b5ce525e4e45faeb9e6955e6a192efcd0c407087f6c61baba171701', // Your private key
});



process.on('message', (msgReq) => {
	
	fnOrden(msgReq);
});


function fnOrden(msgReq){
	clientOrd[msgReq.opt](msgReq.data)
	.then(response => {

		const { status, data } = response;
		console.log(data);

		if(data.error){
			fnOrden(msgReq);
		} else {
			process.send({ cmd: 'fin proceso' });
		}	  
		  
	})
	.catch(err => {
		console.error(err);
		fnOrden(msgReq);
	});		
}



process.send({ cmd: process.pid });

function fnCancelacion(){
	if(swBLoqueo == false && order == null){
		clientOrd.cancelOrder({orderNumber:order.orderNumber}).then(response => {
		  const { status, data } = response;
		  console.log(data);
		  //process.send({ cmd: 'fin proceso', capital: capital });
		  
		  console.log("CANCELACION EXITOSA");
		  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "CANCELACION EXITOSA de " + order.orderNumber + "\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
		  swBLoqueo = false;
		  order = null;
		  if(salir == 'Salir'){
			  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "fnCancelacion\n\n\n\n\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
			process.send({ cmd: 'fin proceso', capital: capital });
			process.exit();	
		  }
		})
		.catch(err => {
			console.error(err);
			console.log("ERROR CANCELACION");
			fsLauncher.appendFileSync('./' + msg[1] + '.txt', "ERROR CANCELACION\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
			fnCancelacion()
		});
	} else {
		console.log("CANCELACION NO REALIZADA");
		  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "CANCELACION NO REALIZADA\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
	}
}


function fnEjecucion(){
	if(swBLoqueo == false && order == null){
		console.log("PETICION DE ORDEN");
		swBLoqueo = true;
		capital = capital * ((retorno - gasto) * 100 / gasto);
								
		var volRef = 2 / precioReferencia;
		volRef = volRef.toFixed(8);
		//console.log({currencyPair: msg[0], rate: precioReferencia, amount: volRef});
		var volOP = volRef * (1 - 0.0025 / 0.9975) / precioOperacion;
		volOP = volOP.toFixed(8);
		console.log({currencyPair: msg[1], rate: precioOperacion, amount: volOP});	
		volRemate = volOP * (1 - 0.0025 / 0.9975) * precioTransada;
		volRemate = volRemate.toFixed(8);
		//console.log({currencyPair: msg[2], rate: precioTransada, amount: volRemate});	
		fsLauncher.appendFileSync('./' + msg[1] + '.txt', "{currencyPair: " + msg[1] + ", rate: " + precioOperacion + ", amount: " + volOP + "}\n", (err) => {
			if (err) throw err;
				////console.log('The "data to append" was appended to file!');
			});
		clientOrd.buy({currencyPair: msg[1], rate: precioOperacion, amount: volOP, fillOrKill: fillOrKill})
			  .then(response => {
				  
				  const { status, data } = response;
				  console.log(data);
				  
				  if(data.error){
					console.log("\n\n\nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
					console.log("**** __ CANCELADA __****");
					console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\n\n");
					swBLoqueo = false;
				  } else if(data.resultingTrades.length > 0){
					 fnGasto({currencyPair: msg[0], rate: precioReferencia, amount: volRef}, {currencyPair: msg[2], rate: precioTransada, amount: volRemate});
				  } else {
					//clientOrd.cancelOrder(data.orderNumber);
					console.log("NUEVA ORDEN: " + data.orderNumber);
					fsLauncher.appendFileSync('./' + msg[1] + '.txt', "NUEVA ORDEN: " + data.orderNumber + "\n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});
					
					order = {};
					order.orderNumber = data.orderNumber;
					
					order.rate = precioOperacion;				
					swBLoqueo = false;
				  }
					
					
				  
				  
			  })
			  .catch(err => {
				  console.error(err);
				  console.log("NO SE PUDO CREAR ORDEN: " + msg[1]);
				  swBLoqueo = false;
				  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "NO SE PUDO CREAR ORDEN: " + msg[1] + "\n", (err) => {
						if (err) throw err;
							////console.log('The "data to append" was appended to file!');
						});
					});							
														
				/*poloniex.unsubscribe(msg[0]);
				poloniex.unsubscribe(msg[1]);
				poloniex.unsubscribe(msg[2]);*/
				//process.exit();
				/*if(volOperacion * precioOperacion < volReferencia){//Puedo operar todo
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
				}*/
			
	}
							
	
}


function fnGasto(obj1, obj2){
	clientOrd.buy(obj1)
	  .then(response => {
		const { status, data } = response;
		console.log(data);
		fsLauncher.appendFileSync('./' + msg[1] + '.txt', JSON.stringify({currencyPair: msg[0], rate: precioReferencia, amount: volRef}) + "}\n", (err) => {
		if (err) throw err;
			////console.log('The "data to append" was appended to file!');
		});
		fnRemate(obj2);
		fsLauncher.appendFileSync('./' + msg[1] + '.txt', JSON.stringify(data) + "\n", (err) => {
		if (err) throw err;
			////console.log('The "data to append" was appended to file!');
		});
			
			
			  
		  
	  })
	  .catch(err => {
		  console.error(err);
		  console.log("NO SE PUDO CREAR ORDEN: " + msg[0]);
		  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "NO SE PUDO CREAR ORDEN: " + msg[0] + "\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
		fnGasto(obj1, obj2);

	  }); 
}

function fnRemate(obj2){
	clientOrd.sell()
		  .then(response => {
			  const { status, data } = response;
			  console.log(data);
			  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "{currencyPair: " + msg[2] + ", rate: " + precioTransada + ", amount: " + volRemate + "}\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
				fsLauncher.appendFileSync('./' + msg[1] + '.txt', JSON.stringify(data) + "\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
			  //swBLoqueo = false;
			  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "fnRemate\n\n\n\n\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
			  process.send({ cmd: 'fin proceso', capital: capital });
			  process.exit();
			  
		  })
		  .catch(err => {
			  console.error(err);
			  console.log("NO SE PUDO CREAR ORDEN: " + msg[2]);
			  fsLauncher.appendFileSync('./' + msg[1] + '.txt', "NO SE PUDO CREAR ORDEN: " + msg[2] + "\n", (err) => {
				if (err) throw err;
					////console.log('The "data to append" was appended to file!');
				});
				fnRemate(obj2);
		});
}