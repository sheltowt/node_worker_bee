var application_root = __dirname,
	express = require("express"),
  path = require("path"),
  http = require('http'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  autoIncrement = require('mongoose-auto-increment'),
  workerFarm = require('worker-farm'),
  twitterWorker = workerFarm(require.resolve('./workers/twitter'));

var app = express();
app.use(bodyParser.json())

app.use(express.static(path.join(application_root, "public")));

// Database
var connection = mongoose.connect('mongodb://localhost/workers');

autoIncrement.initialize(connection);

var Schema = mongoose.Schema;  

var Job = new Schema({
		id: Schema.Types.ObjectId, 
    status: { type: String, required: true },  
    url: { type: String, required: true },   
    modified: { type: Date, default: Date.now }
});

Job.plugin(autoIncrement.plugin, 'JobModel')

var JobModel = connection.model('Job', Job);

app.get('/api', function (req, res) {
	console.log('Node Worker Bee API is running');
  res.send('Node Worker Bee API is running');
});

app.get('/api/jobs', function (req, res){
	console.log('GET /api/jobs');
  return JobModel.find(function (err, jobs) {
    if (!err) {
      return res.send(jobs);
    } else {
      return console.log(err);
    }
  });
});

app.post('/api/jobs', function (req, res){
	console.log('POST /api/jobs');
  var worker;
  console.log("POST: ");
  console.log(req.body);
  job = new JobModel({
    status: req.body.status,
    url: req.body.url,
    modified: req.body.modified
  });
	twitterWorker("http://echo.jsontest.com/key/value/one/two", function (err, outp) {
		console.log(outp)
		workerFarm.end(twitterWorker)
	})
  job.save(function (err) {
    if (!err) {
      return console.log("created");

    } else {
      return console.log(err);
    }
  });
  return res.send(job);
});

app.get('/api/jobs/:id', function (req, res){
	console.log('GET /api/jobs/id');
  return JobModel.findById(req.params.id, function (err, job) {
    if (!err) {
      return res.send(job);
    } else {
      return console.log(err);
    }
  });
});

app.put('/api/jobs/:id', function (req, res){
	console.log('PUT /api/jobs/id');
  return JobModel.findById(req.params.id, function (err, job) {
    job.title = req.body.url;
    job.description = req.body.description;
    job.style = req.body.style;
    return job.save(function (err) {
      if (!err) {
        console.log("updated");
      } else {
        console.log(err);
      }
      return res.send(job);
    });
  });
});

app.delete('/api/jobs/:id', function (req, res){
	console.log('DELETE /api/jobs/id');
  return JobModel.findById(req.params.id, function (err, job) {
    return job.remove(function (err) {
      if (!err) {
        console.log("removed");
        return res.send('');
      } else {
        console.log(err);
      }
    });
  });
});

// Launch server

var server = http.createServer(app);

server.listen(3000);