var express = require('express'),
	routes = require('./routes'),
	fs = require('fs'),
	mongoose = require('mongoose');

module.exports = function () {

	var server = express();

	server.configure(function(){
		app.use(express.bodyParser());
		app.use(express.methodOverride)
	})

	try {
	    var configJSON = fs.readFileSync('../config.json');
	    var config = JSON.parse(configJSON.toString());
	} catch(e) {
	    console.error("File config.json not found or is invalid: " + e.message);
	    process.exit(1);
	}



	return server;

};