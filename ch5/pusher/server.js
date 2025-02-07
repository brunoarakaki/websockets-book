import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import bodyParser from 'body-parser';
import http from 'http';
import Pusher from 'pusher';

console.log("Starting server");

const app = express();
app.use(bodyParser.json());
const httpServer = http.createServer(app);


const pusher = new Pusher({
	appId: "appId",
	key: "key",
	secret: "secret",
	cluster: "eu",
	useTLS: true
});

console.log("Server started");

var clients = [];
var clientIndex = 1

function sendMessage(type, client_uuid, nickname, message) {
	pusher.trigger('chat', type, {
		"id": client_uuid,
		"nickname": nickname,
		"message": message
	});
};

app.post("/nickname", function(req, res) {
	var old_nick = clients[req.body.id].nickname;

	var nickname = req.body.nickname;
	clients[req.body.id].nickname = nickname;

	sendMessage('nickname',
		req.body.id,
		nickname,
		old_nick + " changed nickname to " + nickname);

	console.log('Client ' + old_nick + ' changed nickname to ' + nickname);
	res.status(200).send('');
});

app.post("/login", function(_req, res) {
	const client_uuid = uuidv4();
	const nickname = "AnonymousUser" + clientIndex;
	clientIndex += 1;

	clients[client_uuid] = {
		'id': client_uuid,
		'nickname': nickname
	};
	console.log('Client connected: ' + nickname);
	res.status(200).send(
		JSON.stringify(clients[client_uuid])
	);
});

app.post("/chat", function(req, res) {
	sendMessage(
		'message',
		req.body.id,
		clients[req.body.id].nickname,
		req.body.message
	);
	console.log('Client ' + clients[req.body.id].nickname + ' sent message: ' + req.body.message);
	res.status(200).send("");
});

console.log(' [*] Listening on 0.0.0.0:8181');
httpServer.listen(8181, '0.0.0.0');


app.get('/client.html', function(_req, res) {
	res.sendFile(__dirname + '/client.html');
})

app.get('/style.css', function(_req, res) {
	res.sendFile(__dirname + '/style.css');
});

