import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import http from 'http';
import sockjs from 'sockjs'

console.log("Starting server");

const app = express();
const httpServer = http.createServer(app);
const sockServer = sockjs.createServer({ prefix: '/chat' });

console.log("Server started");

var clients = [];

// const CONNECTING = 0;
const OPEN = 1;
// const CLOSING = 2;
// const CLOSED = 3;


function wsSend(type, client_uuid, nickname, message) {
	for (var i = 0; i < clients.length; i++) {
		var clientSocket = clients[i].connection;
		if (clientSocket.readyState === OPEN) {
			clientSocket.write(JSON.stringify({
				"type": type,
				"id": client_uuid,
				"nickname": nickname,
				"message": message
			}));
		}
	}
}

sockServer.on('connection', function(conn) {
	var client_uuid = uuidv4();
	var nickname = client_uuid.substr(0, 8);
	clients.push({ "id": client_uuid, "connection": conn, "nickname": nickname });
	console.log('client [%s] connected', client_uuid);

	var connect_message = nickname + " has connected";
	wsSend("notification", client_uuid, nickname, connect_message);

	conn.on('data', function(message) {
		console.log(message)
		if (message.indexOf('/nick') === 0) {
			const nickname_array = message.split(' ');
			if (nickname_array.length >= 2) {
				const old_nickname = nickname;
				nickname = nickname_array[1];
				var nickname_message = 'Client ' + old_nickname + ' changed to ' + nickname;
				wsSend("nick_update", client_uuid, nickname, nickname_message);
			}
		} else {
			wsSend("message", client_uuid, nickname, message);
		}
	})

})

sockServer.installHandlers(httpServer);

console.log(' [*] Listening on 0.0.0.0:8181');
httpServer.listen(8181, '0.0.0.0');


app.get('/client.html', function(_req, res) {
	res.sendFile(__dirname + '/client.html');
})

app.get('/style.css', function(_req, res) {
	res.sendFile(__dirname + '/style.css');
});

