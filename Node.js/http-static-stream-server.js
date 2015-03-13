/**
 * A static streaming HTTP server in Node.js
 * @see https://nodejs.org/api (http, url, path, fs, stream)
 * @see https://github.com/broofa/node-mime
 * @installing npm intall mime@1.3.4
 */
var http = require('http')
  , url  = require('url')
  , path = require('path')
  , fs   = require('fs')
  , mime = require('mime');

var host = '127.0.0.1';
var port = 8080;

http.createServer(function httpServer(req, res) {
	var uri = url.parse(req.url).pathname;
	var filename = path.join(process.cwd(), uri);

	var error404 = function (req, res, err) {
		console.log('err',err);
		res.writeHead(404, { 'Content-Type': 'text/plain' });
		res.write('404 Not Found');
		return res.end();
	}

	fs.stat(filename, function (err, stat) {
		if (err) return error404(req, res);
		if (stat.isDirectory()) filename += '/index.html';
		var readStream = fs.createReadStream(filename);
		readStream.on('readable', function () {
			res.writeHead(200, {
				'Content-Type': mime.lookup(filename),
				'Content-Length': stat.size
			});
		});
		readStream.on('error', error404.bind(null, req, res));
		readStream.pipe(res);
	});
}).listen(port, host, function listen() {
	console.log('Server running at http://' + host + ':' + port);
});