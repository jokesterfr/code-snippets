/**
 * An hello world HTTP server in Node.js
 * @see nodejs.org/api/http.html
 */
var fs = require('fs')
  , http = require('http');

var port = 8080;
var host = '127.0.0.1';

var server = http.createServer(function httpServer(req, res) {
	res.writeHead(200, { 'Content-Type': 'text/plain'});
	res.end('Hello World\n');
});

server.listen(port, host, function listen() {
	console.log('Server running at http://' + host + ':' + port);
});