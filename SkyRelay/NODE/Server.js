/*
 * 릴레이 서버를 생성하는 클래스
 */
SkyRelay.Server = CLASS({

	init : (inner, self, port) => {
		
		let waiterStore = SHARED_STORE('waiterStore');
		
		let udpServer = UDP_SERVER(port, (requestInfo, content, response) => {
			
			let index;
			
			while ((index = content.indexOf('\r\n')) !== -1) {
	
				let data = PARSE_STR(content.substring(0, index));
				
				if (data !== undefined) {
					
					// order
					if (data.methodName === 'order') {
						
						data.enemyIP = ip;
						data.enemyPort = port;
						
						udpServer.send({
							ip : ip,
							port : port,
							content : new Buffer(CHECK_IS_DATA(data) === true ? STRINGIFY(data) : data)
						});
					}
					
					// check player waiting
					else if (data.methodName === 'checkPlayerWaiting') {
						
						let waiterInfo = waiterStore.get('waiter-' + data.version + '-' + data.roomId);
						
						if (waiterInfo !== undefined) {
							response(STRINGIFY(waiterInfo));
						}
					}
					
					// for find player
					else if (data.methodName === 'findPlayer') {
						
						let waiterInfo = waiterStore.get('waiter-' + data.version + '-' + data.roomId);
						
						// wait.
						if (waiterInfo === undefined) {
							
							response('waiting');
							
							waiterStore.save({
								id : 'waiter-' + data.version + '-' + data.roomId,
								data : {
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
							
							response(STRINGIFY(waiterInfo));
							
							waiterStore.remove('waiter');
						}
					}
				}
	
				content = content.substring(index + 1);
			}
		});
		
		console.log(CONSOLE_GREEN('Sky Relay 서버를 실행합니다. (포트:' + port + ')'));
	}
});
