import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import http from 'http';
import { Server } from 'socket.io'

console.log("Starting server");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

console.log("Server started");

var clients = [];

function wsSend(type, client_uuid, nickname, message) {
	for (var i = 0; i < clients.length; i++) {
		var clientSocket = clients[i].connection;
		clientSocket.emit(type, {
			id: client_uuid,
			nickname: nickname,
			message: message
		});
	}
}

io.on('connection', function(conn) {
	var client_uuid = uuidv4();
	var nickname = client_uuid.substr(0, 8);
	clients.push({ "id": client_uuid, "connection": conn, "nickname": nickname });
	console.log('client [%s] connected', client_uuid);

	var connect_message = nickname + " has connected";
	wsSend("notification", client_uuid, nickname, connect_message);


	conn.on('message', function(message) {
		console.log(message)
		wsSend("message", client_uuid, nickname, message);
	});

	conn.on('nickname', function(nick) {
		console.log(nick);
		const old_nickname = nickname;
		nickname = nick.nickname;
		var nickname_message = 'Client ' + old_nickname + ' changed to ' + nickname;
		wsSend("nickname", client_uuid, nickname, nickname_message);
	});

	conn.on('disconnect', function() {
		for (var i = 0; i < clients.length; i++) {
			if (clients[i].id == client_uuid) {
				var disconnect_message = nickname + " has disconnected";
				wsSend("notification", client_uuid, nickname, disconnect_message);
				clients.splice(i, 1);
			}
		}
	});


})

console.log(' [*] Listening on 0.0.0.0:8181');
httpServer.listen(8181, '0.0.0.0');


app.get('/client.html', function(_req, res) {
	res.sendFile(__dirname + '/client.html');
})

app.get('/style.css', function(_req, res) {
	res.sendFile(__dirname + '/style.css');
});

