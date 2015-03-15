var http = require('http'),
	models = require('../models/models');

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

      worker = new models.WorkerModel({
      	url: url,
      	result: JSON.parse(data)
      });
      worker.save(function (err) {
    		if (!err) {
      		console.log("worker saved");
      		console.log(jobData)
				  models.JobModel.update({ _id: jobData._id}, { $set: {status: 'complete'}}, function(err){
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

};