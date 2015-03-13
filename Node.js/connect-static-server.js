/**
 * Connect is an extensible HTTP server framework
 * for node using "plugins" known as middleware.
 * 
 * @see https://github.com/senchalabs/connect
 * @see https://github.com/expressjs/serve-static
 * @installing
 *     npm install connect@2.29.0 serve-static@1.9.1 
 *     mkdir -p www
 *     echo '<h1>hello world</h1>' > ./www/index.html
 */
'use strict';
var connect     = require('connect')
  , serveStatic = require('serve-static');

var directory = __dirname + '/www';
var port = 8080;

connect()
	.use(serveStatic(directory, { index: ['index.html']}))
	.listen(port, function listen() {
		console.log('Server listening on port', port);
	});
