var io = require('socket.io')();

io.on('connection', function(client){
	console.log(client);
});

io.listen(3000);