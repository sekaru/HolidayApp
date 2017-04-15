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
    res.json({resp: false, err: "err_lobby_not_found", msg: "Couldn't find that lobby"});
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

// registering a user
app.post('/register', function (req, res) {
  if(!req.body.lobby || !req.body.name || !req.body.pass) {
    return res.status(500).json({resp: false});
  }

  var duplicate = db.get('users')
                    .find({lobby: req.body.lobby, name: req.body.name})
                    .value();
  if(duplicate) {
    return res.json({resp: false, err: 'err_duplicate_name', msg: 'That name is taken'});
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

// get a user's colour
app.get('/get-colour', function (req, res) {
  var user = db.get('users')
                 .find({lobby: req.query.lobby, name: req.query.name})
                 .value();
  
  res.json({resp: user.colour});
});

// logging in
app.post('/login', function (req, res) {
  if(!req.body.name || !req.body.pass) {
    return res.status(500).json({resp: false});
  }

  var user = db.get('users')
               .find({name: req.body.name, pass: req.body.pass})
               .value();

  if(user) {
    console.log("User logged in: " + JSON.stringify(req.body));
    res.json({resp: true});
  } else {
    res.json({resp: false, err: "err_wrong_pass", msg: "Incorrect password"});
  }
});

function randColour() {
    var letters = '123456789ABCD';
    var color = '#';
    for (var i=0; i<6; i++) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}
