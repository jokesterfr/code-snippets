/**
 * A static HTTP server in Node.js
 * @see https://nodejs.org/api (http, url, path, fs)
 */
var http = require('http')
  , url  = require('url')
  , path = require('path')
  , fs   = require('fs');

var port = 8080;
var host = '127.0.0.1';

var server = http.createServer(function httpServer(req, res) {
	var uri = url.parse(req.url).pathname;
	var filename = path.join(process.cwd(), uri);

	var error404 = function (req, res) {
		res.writeHead(404, { 'Content-Type': 'text/plain' });
		res.write('404 Not Found\n');
		return res.end();
	}

	fs.stat(filename, function (err, status) {
		if (err) return error404(req, res);
		if (status.isDirectory()) filename += '/index.html';
		fs.readFile(filename, 'binary', function (err, file) {
			if (err) return error404(req, res);
			res.writeHead(200);
			res.write(file, 'binary');
			res.end();
		});
	});
})

server.listen(port, host, function listen() {
	console.log('Server running at http://' + host + ':' + port);
});
