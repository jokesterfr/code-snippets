/**
 * A tcp server chat implementation
 * @see https://nodejs.org/api (net)
 */
var net = require('net');
 
var port = 9999;
var host = 'localhost';

// Keep track of the chat clients
var clients = [];
 
// Start a TCP Server
net.createServer(function (socket) {
	// Identify this client
	socket.name = socket.remoteAddress + ':' + socket.remotePort
	
	// Put this new client in the list
	clients.push(socket);
	
	// Send a nice welcome message and announce
	socket.write('Welcome ' + socket.name + '\n');
	broadcast(socket.name + ' joined the chat\n', socket);
	
	// Handle incoming messages from clients
	socket.on('data', function (data) {
		broadcast(socket.name + '> ' + data, socket);
	});
	
	// Remove the client from the list when it leaves
	socket.on('end', function () {
		clients.splice(clients.indexOf(socket), 1);
		broadcast(socket.name + ' left the chat.\n');
	});

	// Send a message to all clients
	function broadcast(message, sender) {
		clients.forEach(function (client) {
			// Don't want to send it to sender
			if (client === sender) return;
			client.write(message);
		});
		// Log it to the server output too
		process.stdout.write(message)
	}
}).listen(port, host, function listen() {
	console.log('Server running at tcp://' + host + ':' + port);
});
 