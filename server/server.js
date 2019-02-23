const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');

const httpsOptions = {
	key  : fs.readFileSync(__dirname + '/../../conf/key.pem'),
	cert : fs.readFileSync(__dirname + '/../../conf/cert.pem')
};

const express = require('express');
const socketIO = require('socket.io');
const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/validation');
const { Users } = require('./utils/users');

const publicPath = path.join(__dirname + '/../public');
const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
// const io = socketIO(server);
const users = new Users();

app.use(express.static(publicPath));

server.listen(port, () => {
	console.log(`Server started on port ${port}.`);
});

const httpsServer = https.createServer(httpsOptions, app);
const io = socketIO(httpsServer);

io.on('connection', (socket) => {
	console.log('New user connected.');

	socket.on('join', (params, callback) => {
		if (!isRealString(params.name) || !isRealString(params.room)) {
			return callback('Name and room are required.');
		}

		socket.join(params.room);
		users.removeUser(socket.id);
		users.addUser(socket.id, params.name, params.room);

		io.to(params.room).emit('updateUserList', users.getUserList(params.room));
		socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
		socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined`));

		callback();
	});

	socket.on('disconnect', () => {
		let user = users.removeUser(socket.id);

		if (user) {
			io.to(user.room).emit('updateUserList', users.getUserList(user.room));
			io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
		}
	});

	socket.on('createMessage', (message, callback) => {
		let user = users.getUser(socket.id);

		if (user && isRealString(message.text)) {
			io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
		}

		callback();
		// socket.broadcast.emit('newMessage', {
		//     from: message.from,
		//     text: message.text,
		//     createdAt: new Date().getTime()
		// });
	});

	socket.on('createLocationMessage', (coords) => {
		let user = users.getUser(socket.id);

		io
			.to(user.room)
			.emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
	});

	socket.on('call', (peerId) => {
		let user = users.getUser(socket.id);

		socket.to(user.room).emit('call', peerId);
		console.log(`${peerId} calling everyone...`);
	});
});

httpsServer.listen(4433);
