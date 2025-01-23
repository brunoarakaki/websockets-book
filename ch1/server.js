var WebSocketServer = require('ws').Server,
	wss = new WebSocketServer({ port: 8181 });
wss.on('connection', function(ws) {
	console.log('client.connected');
	ws.on('message', function message(data, isBinary) {
		const message = isBinary ? data : data.toString();
		console.log(message);
	});
});
