/**
 * Proof that `forEach` is blocking when its inner operations are synchronous
 * @see http://ecma262-5.com/ELS5_HTML.htm#Section_15.4.4.18
 */
'use strict';
var fs = require('fs');
var array;

// Sync operation in forEach works as expected
array = ['a', 'b', 'c'];
array.forEach(function (val, i) {
	fs.writeFileSync(val + '.txt', i.toString());
	console.log(val + '.txt', 'written');
});

// Async operation in forEach does not work as expected
array = ['d', 'e', 'f'];
array.forEach(function (val, i) {
	fs.writeFile(val + '.txt', i.toString(), function() {
		console.log(val + '.txt', 'partially written');
	});
});

console.log('ciao');
process.exit(0);