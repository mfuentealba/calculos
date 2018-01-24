const cluster = require('cluster');
const http = require('http');


var server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
  }).listen(8000);
var io = require('socket.io')(server);
console.log(`Worker ${process.pid} started`);
io.on('connection', function(socket){
	console.log("SOCKET!!!!!!!!!!");
  /*socket.emit('request', ); // emit an event to the socket
  io.emit('broadcast', ); // emit an event to all connected sockets*/
  socket.on('reply', function(){ /* */ }); // listen to the event
});//7011