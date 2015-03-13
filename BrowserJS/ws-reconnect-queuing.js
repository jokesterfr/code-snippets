/*
 * @module Ws
 * @author Clément Désiles
 * @date 2014-04-23
 * @copyright Télécom Santé
 * @description API to easily handle websocket connexion in the browser
 * @example
 *     // Queing example
 *     var ws = new Ws({
 *         queueExpiration: -1 // in ms, -1 means infinite
 *     });
 *     ws.emit('newUser', { name: 'Peter' });
 *
 *     // Non-queuing example
 *     var ws = new Ws({ queue: false });
 *     ws.emit('newUser', { name: 'Peter' });
 */
(function (global) { 
	'use strict';

	var CONNECTING = 0  // connection is not yet open
	  , OPEN       = 1  // connection is open and ready to communicate
	  , CLOSING    = 2  // connection is in the process of closing
	  , CLOSED     = 3  // connection is closed or could not be opened

	var Ws = function (options) {
		// Parse options
		extend(this.options, options);
		var _queueExpiration = this.options.queuing ? this.options.queueExpiration : 0
		  , _reconnect       = this.options.reconnect
		  , _protocol        = this.options.protocol
		  , _hostname        = this.options.hostname
		  , _path            = this.options.path
		  , _port            = this.options.port
		  , _uri             = this.options.uri || _protocol + _hostname + ':' + _port

		// Prepend '/' if needed
		_path = _path && _path[0] !== '/' ? '/' + _path : _path;
		_uri += _path;

		// Static internals
		var _ws       = null
		  , _attempts = 0
		  , _queue    = [];

		/**
		 * Init websocket handlers
		 * @return none
		 */
		var _init = function () {
			_attempts++;
			console.log
			_ws = new WebSocket(_uri);
			_ws.addEventListener('open', _onopen);
			_ws.addEventListener('close', _onclose);
			_ws.addEventListener('error', _onerror);
		}

		/**
		 * Handle opening events
		 * @return none
		 */
		var _onopen = function (event) {
			_attempts = 0;
			_sendStack();
			console.info('connected to websocket bus');
		}

		/**
		 * Handle socket close events
		 * @return none
		 */
		var _onclose = function (evt) {
			var delay = _getDelay();
			console.info('attempt n°' + (_attempts), 'retry in', delay / 1000.0 + 's');
			return setTimeout(_init, delay);
		}

		/**
		 * Handle error events
		 * @return none
		 */
		var _onerror = function (evt) {
			/**
			 * Error event is quikly fired after close event,
			 * to avoid any concurrent init attempts, we disable 
			 * it unless `onclose` has not be fired.
			 */
			console.log(_ws.readyState)
			if (_ws.readyState === OPEN) return;
			// return _onclose(evt);
		}

		/**
		 * Exponential delay function
		 * calculated from attempts number.
		 * Delay is limited to 220 s (= 3.6 mn)
		 * @return {Integer} delay
		 */
		var _getDelay = function () {
			var nb = _attempts > 10 ? 10 : _attempts;
			return parseInt(10 * Math.round(Math.exp(nb), 10));
		}

		/**
		 * If socket is not fully available,
		 * add the message to the queue
		 */
		var _addToStack = function (msg) {
			_queue.push({
				date: new Date(),
				msg: msg
			});

			// Prepare queue expiration
			if (_queueExpiration > 0) {
				setTimeout(_flushStack, _queueExpiration);
			}
		}

		/**
		 * Flush the queue by deleting the old messages
		 * @return none
		 */
		var _flushStack = function () {
			var d = new Date();
			d.setMilliseconds(d.getMilliseconds() - _queueExpiration);
			for (var i = 0; i < _queue.length ; i ++) {
				if (_queue[i].date >= d) break;
			}
			_queue.splice(0, i);
		}

		/**
		 * Empty the queue by sending the messages
		 * @return none
		 */
		var _sendStack = function () {
			for (var i = 0; i < _queue.length ; i ++) {
				_ws.send(_queue[i].msg);
			}
			_queue.splice(0, _queue.length);
		}

		/**
		 * Parse message events
		 * @return none
		 */
		var _parser = function (listener, evt) {
			// parse JSON message
			var msg = evt.data;
			try {
				msg = JSON.parse(msg);
			} catch (e) {
				console.warn('cannot parse JSON msg', evt.data);
			}

			if (!listener) {
				_ws.removeEventListener('message', this);
			} else {
				listener(msg);
			}
		};

		/**
		 * Emit a message threw the bus
		 * @param {string} name - message name
		 * @param {object} data - data to be sent
		 * @return none
		 */
		this.emit = function (name, data) {
			var msg = JSON.stringify({
				name: name,
				data: data
			});
			if (_ws.readyState !== OPEN) {
				if (_queueExpiration) _addToStack(msg);
			} else {
				_ws.send(msg);
			}
		}

		/**
		 * Add a listener to the `message` event listener.
		 * a listener can be added more than once.
		 * @param {string} name - message name
		 * @param {function} listener - listener to be called on new message
		 * @return none
		 */
		this.on = function (listener) {
			if (typeof listener !== 'function') {
				throw new Error('listener must be a function');
			}
			_ws.addEventListener('message', _parser.bind(this, listener));
		}

		/** @alias to Ws.emit */
		this.send = this.emit;

		/** @alias to Ws.on */
		this.addEventListener = this.on;

		// Init the bus
		_init();
	}

	/**
	 * Default options
	 */
	Ws.prototype.options = {
		path: '/',
		protocol: 'ws://',
		hostname: window.location.hostname,
		port: window.location.port,
		uri: null,
		reconnect: true,
		queuing: true,
		queueExpiration: 15 * 1000
	}

	/**
	 * Extend a with b prototype
	 * @param {Object} a
	 * @param {Object} b
	 */
	var extend = function (a, b) {
		for (var i in b) {
			a[i] = b[i];
		}
	}

	// Export it
	global.Ws = Ws;

})(window);
