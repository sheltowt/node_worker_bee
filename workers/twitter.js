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

var Job = new Schema({
		id: Schema.Types.ObjectId, 
    status: { type: String, required: true },  
    url: { type: String, required: true },   
    modified: { type: Date, default: Date.now }
});

Job.plugin(autoIncrement.plugin, 'JobModel')

var JobModel = connection.model('Job', Job);

Worker.plugin(autoIncrement.plugin, 'WorkerModel')

var WorkerModel = connection.model('Worker', Worker);

practice = "http://echo.jsontest.com/key/value/one/two"

module.exports = function (url, jobData, callback) {

	var options ={
		host: 'echo.jsontest.com',
		path: '/key/value/one/two'
	}

	callback = http.request(options, function (res) {
		var data = '';
    res.on('data', function (chunk) {
        data += chunk;
    });
    res.on('end', function () {
      console.log(data);

      worker = new WorkerModel({
      	url: url,
      	result: JSON.parse(data)
      });
      worker.save(function (err) {
    		if (!err) {
      		console.log("worker saved");
      		console.log(jobData)
				  JobModel.update({ _id: jobData._id}, { $set: {status: 'complete'}}, function(err){
						if (!err) {
							return console.log("job updated");
						} else {
							return console.log("job failed to update");
						}
					});
    		} else {
      		return console.log(err);
    		}
			});
    });
	});

	callback.on('error', function (e) {
    console.log(e.message);
	});
	callback.end();

}