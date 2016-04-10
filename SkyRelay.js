var
// PORT
PORT = 8726;

require('./UJS-NODE.js');

CPU_CLUSTERING(function() {
	'use strict';
	
	var
	//IMPORT: dgram
	dgram = require('dgram'),
	
	// shared waiter store
	sharedWaiterStore = SHARED_STORE('sharedWaiterStore'),
	
	// server
	server;
	
	server = dgram.createSocket('udp4');
	
	server.on('message', function(message, info) {
		
		var
		// content
		content = message.toString(),
		
		// ip
		ip = info.address,
		
		// port
		port = info.port,
		
		// index
		index,
		
		// data
		data,
		
		// waiter info
		waiterInfo,
		
		// send.
		send = function(data, ip, port) {
			
			var
			// message
			message;
			
			message = new Buffer(CHECK_IS_DATA(data) === true ? STRINGIFY(data) : data);
			
			if (port > 0 && port < 65536) {
				server.send(message, 0, message.length, port, ip);
			}
		},
		
		// response.
		response = function(data) {
			
			var
			// message
			message;
			
			message = new Buffer(CHECK_IS_DATA(data) === true ? STRINGIFY(data) : data);
			
			server.send(message, 0, message.length, port, ip);
		};
		
		while (( index = content.indexOf('\r\n')) !== -1) {

			data = PARSE_STR(content.substring(0, index));
			
			if (data !== undefined) {
				break;
			}

			content = content.substring(index + 1);
		}
		
		if (data !== undefined) {
			
			// order
			if (data.methodName === 'order') {
				
				data.enemyIP = ip;
				data.enemyPort = port;
				
				send(data, data.ip, data.port);
			}
			
			// check player waiting
			else if (data.methodName === 'checkPlayerWaiting') {
				response(sharedWaiterStore.get('waiter-' + data.version + '-' + data.roomId));
			}
			
			// for find player
			else if (data.methodName === 'findPlayer') {
				
				waiterInfo = sharedWaiterStore.get('waiter-' + data.version + '-' + data.roomId);
				
				// wait.
				if (waiterInfo === undefined) {
					
					response('waiting');
					
					sharedWaiterStore.save({
						name : 'waiter-' + data.version + '-' + data.roomId,
						value : {
							ip : ip,
							port : port,
							localIP : data.localIP,
							localPort : data.localPort
						},
						removeAfterSeconds : 3
					});
				}
				
				// if waiter
				else if (waiterInfo.ip === ip && waiterInfo.port === port && waiterInfo.localIP === data.localIP && waiterInfo.localPort === data.localPort) {
					response('waiting');
				}
				
				// match.
				else {
					
					send('knock', waiterInfo.ip, waiterInfo.port);
					
					response(waiterInfo);
					
					sharedWaiterStore.remove('waiter');
				}
			}
		}
	});
	
	server.on('listening', function() {
		console.log('RUNNING SKY RELAY... (PORT:' + PORT + ')');
	});
	
	server.bind(PORT);
});
