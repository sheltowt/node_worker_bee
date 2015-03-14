var server = require('./server/index.js'),
	http = require('http');

https.createServer(server).listen(3000, function(){
	console.lof("Expess server listening on port 3000");
});