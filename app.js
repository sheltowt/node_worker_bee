var application_root = __dirname,
	express = require("express"),
  path = require("path"),
  http = require('http'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  autoIncrement = require('mongoose-auto-increment')
  workerFarm = require('worker-farm'),
  twitterWorker = workerFarm(require.resolve('./workers/twitter'));

var app = express();
app.use(bodyParser.json())

app.use(express.static(path.join(application_root, "public")));

// Database

var connection = mongoose.connect('mongodb://localhost/workers');

autoIncrement.initialize(connection);

var Schema = mongoose.Schema;  

var Worker = new Schema({
		id: Schema.Types.ObjectId, 
    status: { type: String, required: true },  
    data: { type: Schema.Types.Mixed, required: true },   
    modified: { type: Date, default: Date.now }
});

Worker.plugin(autoIncrement.plugin, 'WorkerModel')

var WorkerModel = connection.model('Worker', Worker);

app.get('/api', function (req, res) {
	console.log('Node Worker Bee API is running');
  res.send('Node Worker Bee API is running');
});

app.get('/api/workers', function (req, res){
	console.log('GET /api/workers');
  return WorkerModel.find(function (err, workers) {
    if (!err) {
      return res.send(workers);
    } else {
      return console.log(err);
    }
  });
});

app.post('/api/workers', function (req, res){
	console.log('POST /api/workers');
  var worker;
  console.log("POST: ");
  console.log(req.body);
  worker = new WorkerModel({
    status: req.body.status,
    data: req.body.data,
    modified: req.body.modified
  });
  for (var i = 0; i <10; i++) {
  	twitterWorker('#' + i + ' FOO', function (err, outp) {
  		console.log(outp)
  		if (i == 10) {
  			workerFarm.end(twitterWorker)
  		}
  	})
  }
  worker.save(function (err) {
    if (!err) {
      return console.log("created");

    } else {
      return console.log(err);
    }
  });
  return res.send(worker);
});

app.get('/api/workers/:id', function (req, res){
	console.log('GET /api/workers/id');
  return WorkerModel.findById(req.params.id, function (err, worker) {
    if (!err) {
      return res.send(worker);
    } else {
      return console.log(err);
    }
  });
});

app.put('/api/workers/:id', function (req, res){
	console.log('PUT /api/workers/id');
  return WorkerModel.findById(req.params.id, function (err, worker) {
    worker.title = req.body.title;
    worker.description = req.body.description;
    worker.style = req.body.style;
    return worker.save(function (err) {
      if (!err) {
        console.log("updated");
      } else {
        console.log(err);
      }
      return res.send(worker);
    });
  });
});

app.delete('/api/workers/:id', function (req, res){
	console.log('DELETE /api/workers/id');
  return WorkerModel.findById(req.params.id, function (err, worker) {
    return worker.remove(function (err) {
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