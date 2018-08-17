'use strict'

var mongoose = require("mongoose");

var Schema = mongoose.Schema;

const ordenSchema = Schema({
  
  ordenes :  {
    type: Object    
  } 
})

//const userModel = mongoose.model('Usuario', userSchema)

//module.exports = mongoose.model('Usuarios', userSchema);
//export default userModel;
module.exports = mongoose.model('Orden', ordenSchema, 'Ordenes');
