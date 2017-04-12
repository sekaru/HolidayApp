var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var low = require('lowdb');
var app = express();

app.use(cors());
app.use(bodyParser.json());

// set defaults
var db = low('db.json');
db.defaults({ lobbies: [], users: [] })
  .write()

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/make-lobby', function (req, res) {
  db.get('lobbies')
    .push({id: req.body.id})
    .write();

  console.log("made lobby: " + req.body.id);
  res.status(200).json({response: true});
});

var server = app.listen(3000, function () {
  var port = server.address().port;
  console.log("JPS API listening on port " + port);
});