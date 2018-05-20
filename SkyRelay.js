require('uppercase-core');

BOX('SkyRelay');
require('./SkyRelay/NODE/Server');

CPU_CLUSTERING(() => {
	
	let config = JSON.parse(READ_FILE({
		path : 'config.json',
		isSync : true
	}));
	
	SkyRelay.Server(config.port);
});
