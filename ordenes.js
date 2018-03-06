const poloniexOrd = require('poloniex-exchange-api');

const clientOrd = poloniexOrd.getClient({
    publicKey : '0NP8Y42K-0OIG2UWY-Z3XYC9J8-YD716RQX', // Your public key
    privateKey: '0e51040bbd62bb0b6b733424224a732bb21b4e2f89a6d41d95aab0b5e1bb032f1cf14fb3b2931da0e8932f9340149d1ca20280e2bc63e4679bef407f05d6ad60', // Your private key
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
			if(data.error.indexOf("Nonce must be greater") > 0){
				process.send({ cmd: 'fin proceso', orderNumber: data.orderNumber});
			} else {
				fnOrden(msgReq);	
			}
			
		} else {
			process.send({ cmd: 'fin proceso', orderNumber: data.orderNumber});
		}	  
		  
	})
	.catch(err => {
		console.error(err);
		fnOrden(msgReq);
	});		
}



process.send({ cmd: process.pid });
