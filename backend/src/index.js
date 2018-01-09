var io = require('socket.io')();

io.on('connection', function(client){
	console.log('CONNECT');
	client.emit("hi", {
		content:"Oh Hi player",
	  	code: 300
	});

	client.on('test', (x,y,z, callback)=>{
		console.log('TEST');
		console.log(x+','+y+','+z);
		console.log(callback);
		callback("ok test");
	});

	client.on('player position', (content, callback)=>{
		console.log('PLAYER POSITION');
		console.log(content);
		console.log(callback);
		callback('ok position');
	})
});



io.listen(3000);
