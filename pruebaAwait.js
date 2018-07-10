'use strict'

var secretSouth = 'tTiQAtoIJRAttGNbFBElwrCUmvdrwqBoPSjvucrYGJFJJkjPWU';

    const crypto = require('crypto');
    var request = require('request');
    


main();

async function main(){
    
    
        
        
   
    
    console.log('INICIO');
    await fn();
    console.log('FIN');
    	
    
}

function fn(){
    var date = new Date;			
    var nonce = date.getTime();  
    var req = {nonce: nonce, key: 'uUVmpIxtbxJWMrNOrOBkXXWKPXnJdh'}  
    var headers = fnHeader(req);
    
    var options = {
    url     : 'https://www.southxchange.com/api/listOrders',
    method  : 'POST',
    //jar     : true,
    headers : headers,
    json : true,
    body:	req//JSON.stringify(req)
    }
    request.post(options, fnListOrders);
}

 function fnListOrders(err,httpResponse,body) {
  console.log(body);
 

  
  
}




function fnHeader(req){
				
	const hmac = crypto.createHmac('sha512', secretSouth);	
	var hash = hmac.update(JSON.stringify(req), 'utf8').digest('hex');	
	return {
		//'User-Agent':       'Super Agent/0.0.1',
		'Content-Type':     'application/json',
		'Hash': 			hash//createToken()
	}
}


