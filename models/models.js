var mongoose = require('mongoose'),
	autoIncrement = require('mongoose-auto-increment'),
	connection = mongoose.connect('mongodb://localhost/workers');

module.exports = function() {
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

	Job.plugin(autoIncrement.plugin, 'JobModel');
	Worker.plugin(autoIncrement.plugin, 'WorkerModel');

	var models = {
		JobModel: connection.model('Job', Job),
		WorkerModel: connection.model('Worker', Worker)
	}

	return models;

};