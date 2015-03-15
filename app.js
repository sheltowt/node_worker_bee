var application_root = __dirname,
	express = require("express"),
  path = require("path"),
  http = require('http'),
  bodyParser = require('body-parser'),
  workerFarm = require('worker-farm'),
  twitterWorker = workerFarm(require.resolve('./workers/twitter')),
  queue = require('queue'),
  models = require('./models/models')();;

var app = express();
app.use(bodyParser.json())

app.use(express.static(path.join(application_root, "public")));

//initialize queue
var queue = require('queue');
var q = queue();

app.get('/api', function (req, res) {
	console.log('Node Worker Bee API is running');
  res.send('Node Worker Bee API is running');
});

app.get('/api/jobs', function (req, res){
	console.log('GET /api/jobs');
  return models.JobModel.find(function (err, jobs) {
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
  job = new models.JobModel({
    status: req.body.status,
    url: req.body.url,
    modified: req.body.modified
  });
  job.save(function (err, jobData) {
    if (!err) {
			twitterWorker("http://echo.jsontest.com/key/value/one/two", jobData, function (err, outp) {
				console.log(outp)
				workerFarm.end(twitterWorker)
			})
    } else {
      console.log(err);
    }
  });

  return res.send(job);
});

app.get('/api/jobs/:id', function (req, res){
	console.log('GET /api/jobs/id');
  return models.JobModel.findById(req.params.id, function (err, job) {
    if (!err) {
      return res.send(job);
    } else {
      return console.log(err);
    }
  });
});

app.put('/api/jobs/:id', function (req, res){
	console.log('PUT /api/jobs/id');
  return models.JobModel.findById(req.params.id, function (err, job) {
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
  return models.JobModel.findById(req.params.id, function (err, job) {
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