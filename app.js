var application_root = __dirname,
	express = require("express"),
  path = require("path"),
  http = require('http'),
  bodyParser = require('body-parser'),
  workerFarm = require('worker-farm'),
  urlWorker = workerFarm(require.resolve('./workers/url_retriever')),
  queue = require('queue'),
  models = require('./models/models');

var app = express();
app.use(bodyParser.json())

app.use(express.static(path.join(application_root, "public")));

// initialize queue
var queue = require('queue');
q = queue();

q.timeout = 300;

q.on('timeout', function(next, job) {
  console.log('job timed out:', job.toString().replace(/\n/g, ''));
  next();
});

app.get('/status', function (req, res) {
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
  job = new models.JobModel({
    status: 'Queued',
    url: req.body.url,
    description: req.body.description
  });
  job.save(function (err, jobData) {
    if (!err) {
      q.push(function(){
        urlWorker(req.body.url, jobData)
      });
      q.start(function(err) {
        console.log('all done:', err);
      });
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
    console.log(job)
    if(!err && (job != null)) {
      if (req.body.url != job.url) {
        job.url = req.body.url;
        job.status = 'Queued';
        q.push(function(){
          urlWorker(req.body.url, job)
        });
        q.start(function(err) {
          console.log('all done:', err);
        });
      }
      job.description = req.body.description;
      return job.save(function (err) {
        if (!err) {
          console.log("updated");
        } else {
          console.log(err);
        }
        return res.send(job);
      });
    } else {
      console.log(err);
      return res.send('');
    }
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