var application_root = __dirname,
	express = require("express"),
  path = require("path"),
  http = require('http'),
  mongoose = require('mongoose');

var app = express();

// Database

mongoose.connect('mongodb://localhost/workers');

var Schema = mongoose.Schema;  

var Worker = new Schema({
		id: { type: String, required: true }, 
    status: { type: String, required: true },  
    data: { type: String, required: true },   
    modified: { type: Date, default: Date.now }
});

var WorkerModel = mongoose.model('Worker', Worker);

app.get('/api', function (req, res) {
  res.send('Node Worker Bee API is running');
});

// Launch server

var server = http.createServer(app);

server.listen(3000);