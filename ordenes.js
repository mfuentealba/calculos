const poloniexOrd = require('poloniex-exchange-api');

const clientOrd = poloniexOrd.getClient({
    publicKey : 'PBMWDHM0-YCD05QGE-5JT1U02H-BWJ96QSM', // Your public key
    privateKey: '840a5f51eaf0f75002d0292c205ad602c134a656667bcaa3c7b1fdedbe16e53c07089832f4b6967ed866841300c7ac083d790b446abd7327bade08b86d16a4eb', // Your private key
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
