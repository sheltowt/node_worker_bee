var mongoose = require('mongoose'),
	connection = mongoose.connect('mongodb://localhost/workers'),
	http = require('http'),
	autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(connection);

var Schema = mongoose.Schema; 

var Worker = new Schema({
		id: Schema.Types.ObjectId,
		url: { type: String, required: true }, 
    result: { type: Schema.Types.Mixed, required: false },   
    modified: { type: Date, default: Date.now }
});

Worker.plugin(autoIncrement.plugin, 'WorkerModel')

var WorkerModel = connection.model('Worker', Worker);

practice = "http://echo.jsontest.com/key/value/one/two"

module.exports = function (url, callback) {
	callback(null, url + ' BAR (' + process.pid + ')')

	var options ={
		host: 'http://echo.jsontest.com',
		path: '/key/value/one/two'
	}

	var request = http.request(options, function (res) {
		var data = '';
    res.on('data', function (chunk) {
        data += chunk;
    });
    res.on('end', function () {
      console.log(data);
      worker = new WorkerModel({
      	url: url,
      	result: data
      });
      worker.save(function (err) {
    		if (!err) {
      		return console.log("created");
    		} else {
      		return console.log(err);
    		}
			});
    });
	});

	request.on('error', function (e) {
    console.log(e.message);
	});
	request.end();

}