var http = require('http'),
	models = require('../models/models');

module.exports = function (url, jobData) {

	retrieveData = http.request(url, function (res) {
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
				  models.JobModel.update({ _id: jobData._id}, { $set: {status: 'Completed', lastWorkerId: workerData._id, result: JSON.parse(data)}}, function(err){
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

	retrieveData.on('error', function (e) {
    console.log(e.message);
	});
	retrieveData.end();

};