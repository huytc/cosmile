// const peer = new Peer({
// 	host   : '172.20.10.3',
// 	port   : 4433,
// 	debug  : 3,
// 	config : {
// 		iceServers : [ { url: 'stun:stun1.l.google.com:19302' } ]
// 	}
// });

const peer = new Peer({});

const call = (id) => {
	navigator.getUserMedia(
		{ video: true, audio: true },
		function(stream) {
			const call = peer.call(id, stream);
			const localVideo = document.getElementById('local-video');
			localVideo.srcObject = stream;
			call.on('stream', function(remoteStream) {
				// Show stream in some video/canvas element.
				const remoteVideo = document.getElementById('remote-video');
				remoteVideo.srcObject = remoteStream;
			});
		},
		function(err) {
			console.log('Failed to get local stream', err);
		}
	);
};

peer.on('open', (id) => {
	console.log(id);
});

peer.on('call', function(call) {
	navigator.getUserMedia(
		{ video: true, audio: true },
		function(stream) {
			call.answer(stream); // Answer the call with an A/V stream.
			const localVideo = document.getElementById('local-video');
			localVideo.srcObject = stream;
			call.on('stream', function(remoteStream) {
				// Show stream in some video/canvas element.
				const remoteVideo = document.getElementById('remote-video');
				remoteVideo.srcObject = remoteStream;
			});
		},
		function(err) {
			console.log('Failed to get local stream', err);
		}
	);
});

const callButton = document.getElementById('call');
callButton.onclick = function(ev) {
	const id = document.getElementById('peer-id').value;
	call(id);
};
