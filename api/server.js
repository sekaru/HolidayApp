var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var low = require('lowdb');
var app = express();

app.use(cors());
app.use(bodyParser.json());

var server = app.listen(3000, function () {
  var port = server.address().port;
  console.log("JPS API listening on port " + port);
});

// set defaults
var db = low('db.json');
db.defaults({ lobbies: [], users: [] })
  .write()

// generating a lobby code
app.get('/lobby-code', function (req, res) {
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var len = 5;
  var code = "";

  do {
    code = "";
    for(var i=0; i<len; i++) {
      code += possible.charAt(Math.floor(Math.random() * possible.length));
    }
  } while(duplicateCode(code));

  res.json({code: code});
});

function duplicateCode(code) {
  var lobby = db.get('lobbies')
                .find({id: code})
                .value();

  if(!lobby) {
    return false;
  } else {
    return true;
  }
}

// checking lobbies exists
app.get('/lobby', function (req, res) {
  var lobby = db.get('lobbies')
              .find({id: req.query.id})
              .value();
  
  if(!lobby) {
    res.status(404).json({resp: false, err: "err_lobby_not_found", msg: "Couldn't find that lobby"});
  } else {
    res.json({resp: true, code: lobby.id});
  }
});

// making lobbies
app.post('/make-lobby', function (req, res) {
  db.get('lobbies')
    .push({id: req.body.id})
    .write();

  console.log("Created lobby ID: " + req.body.id);
  res.json({resp: true});
});

// making a user
app.post('/make-user', function (req, res) {
  if(!req.body.lobby || !req.body.name || !req.body.pass) {
    res.status(500).json({resp: false});
    return;
  }

  var colour = randColour();
  db.get('users')
    .push({lobby: req.body.lobby, name: req.body.name, pass: req.body.pass, colour: colour})
    .write();

  console.log("Added new user: " + JSON.stringify(req.body));
  res.json({resp: true});
});

// get users
app.get('/get-users', function (req, res) {
  var users = db.get('users')
                .value();
  
  var lobbyUsers = [];
  for(var i=0; i<users.length; i++) {
    if(users[i].lobby==req.query.id) {
      lobbyUsers.push(users[i]);
    }
  }
  
  res.json(lobbyUsers);
});

function randColour() {
    var letters = '123456789ABCD';
    var color = '#';
    for (var i=0; i<6; i++) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}
