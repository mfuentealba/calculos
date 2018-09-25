//{"aggId":16,"price":"0.01907100","quantity":"0.21000000","firstId":16,"lastId":16,"timestamp":1500010882052,"isBuyerMaker":false,"wasBestPrice":true,"time":"2017-07-14T05:41:22.052Z"}

/**********PROCESO***************/
var fs = require('fs');

var arrFile = ['data_LTCBTC2017-07-14.txt'];


fnProcesoArchivos(arrFile);

var BB = require('./technicalindicators.js').BollingerBands;

var period = 14

var ini = {
period : period, 
values : [] ,
stdDev : 2
    
}

var bb = new BB(ini);




/**********FUNCIONES***************/


async function fnProcesoArchivos(arrFile){
	for(var arch of arrFile){
		await fs.readFile(arch, 'utf8', function(err, data) {		
			fnLecturaArchivo(err, data);
		});	
		console.log(arch + " Listo!!");
	}
}

function fnLecturaArchivo(err, data){
	
	var arr = data.split("\n");
	var objVela = {}
	objVela.volumen = 0;
	objVela.volBuy = 0;
	objVela.volSell = 0;
	let objIni = JSON.parse(arr[0]);
	objVela.high = Number(objIni.price);
	objVela.low = Number(objIni.price);
	objVela.open = Number(objIni.price);
	objVela.close = Number(objIni.price);
	
	
	for(let str of arr){		
		var obj;
		try{
			obj = JSON.parse(str);
		} catch(e){
			console.log(str);
		}
		
		obj.price = Number(obj.price);
		obj.quantity = Number(obj.quantity);
		objVela.volumen += Number(obj.quantity);
		if(objVela.high < obj.price){
			objVela.high = obj.price;
		}
		if(objVela.low > obj.price){
			objVela.low = obj.price;
		}
		if(obj.isBuyerMaker){
			objVela.volSell += obj.quantity;
		} else {
			objVela.volBuy += obj.quantity;
		}
		objVela.close = obj.price;
	}
	
	
	console.log(objVela);
	
}


