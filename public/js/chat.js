const socket = io();
const peer = new Peer({});

let peerId;

const call = (id) => {
	navigator.getUserMedia(
		{ video: true, audio: false },
		function(stream) {
			const call = peer.call(id, stream);
			call.on('stream', function(remoteStream) {
				// Show stream in some video/canvas element.
				const video = jQuery(`<video id="${id}" width="240px" height="240px" autoplay></video>`);
				jQuery('#video-container').append(video);
				video[0].srcObject = remoteStream;
			});
		},
		function(err) {
			console.log('Failed to get local stream', err);
		}
	);
};

peer.on('open', (id) => {
	peerId = id;
	console.log(id);
});

peer.on('call', function(call) {
	navigator.getUserMedia(
		{ video: true, audio: false },
		function(stream) {
			call.answer(stream); // Answer the call with an A/V stream.
			const video = jQuery(`<video id="${peerId}" width="240px" height="240px" autoplay></video>`);
			jQuery('#video-container').append(video);
			video[0].srcObject = stream;
			// const localVideo = document.getElementById('local-video');
			// localVideo.srcObject = stream;
			// call.on('stream', function(remoteStream) {
			// 	// Show stream in some video/canvas element.
			// 	const remoteVideo = document.getElementById('remote-video');
			// 	remoteVideo.srcObject = remoteStream;
			// });
		},
		function(err) {
			console.log('Failed to get local stream', err);
		}
	);
});

function scrollToBottom() {
	// Selectors
	let messages = jQuery('#messages');
	let newMessage = messages.children('li:last-child');

	// Heights
	let clientHeight = messages.prop('clientHeight');
	let scrollTop = messages.prop('scrollTop');
	let scrollHeight = messages.prop('scrollHeight');
	let newMessageHeight = newMessage.innerHeight();
	let lastMessageHeight = newMessage.prev().innerHeight();

	if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
		messages.scrollTop(scrollHeight);
	}
}

socket.on('connect', function() {
	let params = jQuery.deparam(window.location.search);

	socket.emit('join', params, function(err) {
		if (err) {
			alert(err);
			window.location.href = '/';
		} else {
			console.log('No error');
		}
	});
});

socket.on('disconnect', function() {
	console.log('Disconnected from server.');
});

socket.on('updateUserList', function(users) {
	let ol = jQuery('<ol></ol>');

	users.forEach(function(user) {
		ol.append(jQuery('<li></li>').text(user));
	});

	jQuery('#users').html(ol);
});

socket.on('newMessage', function(message) {
	// console.log('Received new message:', JSON.stringify(message, undefined, 2));

	let formattedTime = moment(message.createdAt).format('h:mm a');
	// let li = jQuery('<li></li>');
	// li.text(`${message.from} ${formattedTime}: ${message.text}`);

	// jQuery('#messages').append(li);

	let template = jQuery('#message-template').html();
	let html = Mustache.render(template, {
		from      : message.from,
		text      : message.text,
		createdAt : formattedTime
	});

	jQuery('#messages').append(html);
	scrollToBottom();
});

socket.on('newLocationMessage', function(message) {
	let formattedTime = moment(message.createdAt).format('h:mm a');
	// let li = jQuery('<li></li>');
	// let a = jQuery('<a target="_blank">My current location</a>');

	// li.text(`${message.from} ${formattedTime}: `);
	// a.attr('href', message.url);

	// li.append(a);
	// jQuery('#messages').append(li);

	let template = jQuery('#location-message-template').html();
	let html = Mustache.render(template, {
		from      : message.from,
		url       : message.url,
		createdAt : formattedTime
	});

	jQuery('#messages').append(html);
});

socket.on('call', function(peerId) {
	console.log(`${peerId} calling...`);
	call(peerId);
});

jQuery('#message-form').on('submit', function(e) {
	e.preventDefault();

	let messageTextbox = jQuery('[name=message]');

	socket.emit(
		'createMessage',
		{
			text : messageTextbox.val()
		},
		function() {
			messageTextbox.val('');
		}
	);
});

let locationButton = jQuery('#send-location');
locationButton.on('click', function() {
	if (!navigator.geolocation) {
		return alert('Geolocation not supported by your browser.');
	}

	locationButton.attr('disabled', 'disabled').text('Sending location...');

	navigator.geolocation.getCurrentPosition(
		function(position) {
			socket.emit('createLocationMessage', {
				latitude  : position.coords.latitude,
				longitude : position.coords.longitude
			});
			locationButton.removeAttr('disabled').text('Send location');
		},
		function() {
			alert('Unable to fetch location.');
			locationButton.removeAttr('disabled').text('Send location');
		}
	);
});

let videoCallButton = jQuery('#video-call');
videoCallButton.on('click', function() {
	// jQuery('#video-container').append('<video width="160px" height="160px" controls></video>');
	let params = jQuery.deparam(window.location.search);

	socket.emit('call', peerId);
});
