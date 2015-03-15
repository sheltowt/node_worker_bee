var http = require('http'),
	models = require('../models/models');

module.exports = function (url, jobData, callback) {

	callback = http.request(url, function (res) {
		var data = '';
    res.on('data', function (chunk) {
        data += chunk;
    });
    res.on('end', function () {
      console.log(data);

      worker = new models.WorkerModel({
      	jobId: jobData._id,
      	url: url,
      	result: JSON.parse(data)
      });
      worker.save(function (err, workerData) {
    		if (!err) {
      		console.log("worker saved");
      		console.log(jobData)
				  models.JobModel.update({ _id: jobData._id}, { $set: {status: 'Completed', workerId: workerData._id}}, function(err){
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