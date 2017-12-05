var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var low = require('lowdb');
var ImageResolver = require('image-resolver');
var bcrypt = require('bcryptjs');
var randomColor = require('randomcolor');
var app = express();

app.use(bodyParser.json());

var whitelist = [
  'http://localhost:4200',
  'http://justpick.it'
];

var corsOptions = {
  origin: function(origin, callback){
        var isWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
  },
  credentials: true
}
app.use(cors(corsOptions));

var server = app.listen(3000, "0.0.0.0", function () {
  var port = server.address().port;
  console.log("JPI listening on port " + port);
});

// set defaults
var db = low('db.json');
db.defaults({ lobbies: [], users: [], places: [] }) 
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
    return res.json({resp: false, err: "err_missing_details", msg: "All the fields are required"});
  }

  var duplicate = db.get('users')
                    .find({lobby: req.body.lobby, name: req.body.name})
                    .value();
  if(duplicate) {
    return res.json({resp: false, err: 'err_duplicate_name', msg: 'That name is taken'});
  }

  // hash the password
  bcrypt.hash(req.body.pass, 10, function(err, hash) {
      // push them to the db
      var colour = randomColor();
      db.get('users')
        .push({lobby: req.body.lobby, name: req.body.name, pass: hash, colour: colour})
        .write();

      console.log("Added new user: " + JSON.stringify({lobby: req.body.lobbyID, name: req.body.name}));
      res.json({resp: true});
  });
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
  if(!req.body.pass) {
    return res.json({resp: false, err: "err_missing_details", msg: "You need to enter a password"});
  }

  var user = db.get('users')
                .find({lobby: req.body.lobby, name: req.body.name})
                .value();
  if(user) {
    bcrypt.compare(req.body.pass, user.pass, function(err, result) {
      if(result && !err) {
        console.log("User logged in: " + JSON.stringify({lobby: req.body.lobbyID, name: req.body.name}));
        res.json({resp: true});
      } else {
        res.json({resp: false, err: "err_wrong_pass", msg: "Incorrect password"});
      }
    });
  } else {
    res.json({resp: false, err: "err_user_doesnt_exist", msg: "User doesn't exist"});
  }
});

// logging in (via cookie) 
app.post('/cookie-login', function (req, res) {
  
  if(!req.body.lobby || !req.body.name) {
    return res.json({resp: false, err: "err_missing_details", msg: "Nice try!"});
  }

  var user = db.get('users')
                .find({name: req.body.name})
                .value();

  if(!user) return res.json({resp: false, err: "err_unknown_user", msg: "Couldn't find that user"});

  console.log("User logged in (via cookie): " + JSON.stringify(req.body));
  res.json({resp: true});
});

// adding a place
app.post('/add-place', function (req, res) {
  if(!req.body.link || req.body.link.length<=7 || !req.body.price || req.body.price.length<=1) {
    return res.json({resp: false, err: "err_missing_details", msg: "You haven't filled in all the required fields"})
  }

  var duplicate = db.get('places')
                    .find({lobby: req.body.lobby, link: req.body.link});

  var fallback = "https://unsplash.it/1280/720?image=" + (10 + Math.floor(Math.random()*200));

  if(duplicate.value()) {
    // return res.json({resp: false, err: "err_duplicate_place", msg: "That place is already in your lobby"});
    if(!req.body.image) req.body.image = fallback;

    duplicate.assign({link: req.body.link, price: req.body.price, desc: req.body.desc, image: req.body.image, latlng: req.body.latlng})
             .write();

    return res.json({resp: true});
  }

  db.get('places')
    .push({lobby: req.body.lobby, author: req.body.author, 
           link: req.body.link, price: req.body.price, desc: req.body.desc, 
           votes: 1, upvoters: [req.body.author], downvoters: [], rot: randRot(), image: req.body.image})
    .write();

  if(!req.body.image) {
    var resolver = new ImageResolver();
    resolver.register(new ImageResolver.FileExtension());
    resolver.register(new ImageResolver.MimeType());
    resolver.register(new ImageResolver.Opengraph());
    resolver.register(new ImageResolver.Webpage());
  
    resolver.resolve(req.body.link, function (result) {
        if(result) {
          db.get('places')
            .find({lobby: req.body.lobby, link: req.body.link})
            .assign({image: result.image})
            .write();
        } else {
          db.get('places')
            .find({lobby: req.body.lobby, link: req.body.link})
            .assign({image: fallback})
            .write();
          console.log("No image found for " + req.body.link);
        }
    });
  }

  console.log("Added new place: " + JSON.stringify(req.body));

  res.json({resp: true});
});

function randRot() {
  var min = -1.25;
  var max = 1.25;
  return Math.random() * (max - min) + min;
}

// deleting a place
app.post('/delete', function (req, res) {
  var place = db.get('places')
                    .find({lobby: req.body.lobby, link: req.body.link})
                    .value();

  if(!place) {
    return res.json({resp: false});
  }

  if(place.archived) {
    db.get('places')
      .remove({lobby: req.body.lobby, link: req.body.link})
      .write();
  } else {
    db.get('places')
      .find({lobby: req.body.lobby, link: req.body.link})
      .assign({archived: true})
      .write();
  }

  console.log('Deleted: ' + JSON.stringify({lobby: req.query.lobby, link: req.query.link}));

  res.json({resp: true});
});

// get places
app.get('/get-places', function (req, res) {
  var sort = '';
  var ascSorts = [1, 3, 4];

  switch(parseInt(req.query.sort)) {
    case 0:
    case 1:
      sort = 'lobby'
      break;
    case 2:
    case 3:
      sort = 'votes';
      break;
    case 4:
      sort = 'price';
      break;
  }

  var places = db.get('places')
                 .sortBy(sort)
                 .value();

  var lobbyPlaces = [];
  for(var i=0; i<places.length; i++) {
    if(places[i].lobby==req.query.lobby) lobbyPlaces.push(places[i]);
  }

  // price
  if(sort=='price') lobbyPlaces = sortPrice(lobbyPlaces);
  
  // ascending sort
  if(ascSorts.indexOf(parseInt(req.query.sort))!=-1) {
    lobbyPlaces.reverse();
  }

  res.json(lobbyPlaces);
});

function sortPrice(array) {
    return array.sort(function(a, b) {
        var aa = a.price.startsWith("Scale") ? a.price.split("Scale")[1].length*10 : a.price.substring(1);
        var bb = b.price.startsWith("Scale") ? b.price.split("Scale")[1].length*10 : b.price.substring(1);

        var x = parseInt(aa);
        var y = parseInt(bb);

        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

// voting
app.post('/vote', function (req, res) {
  var place = db.get('places').find({lobby: req.body.lobby, link: req.body.link}).value();
  var votes = place.votes;
  var name = req.body.name;

  if(req.body.type==0) { // upvote
    if(place.upvoters.indexOf(name)==-1) place.upvoters.push(name);

    var index = place.downvoters.indexOf(name);
    if(index!=-1) place.downvoters.splice(index, 1);
    votes++;

    db.get('places').find({lobby: req.body.lobby, link: req.body.link})
                    .assign({votes: votes, upvoters: place.upvoters, downvoters: place.downvoters})
                    .write();
  } else if(req.body.type==1) { // downvote
    if(place.downvoters.indexOf(name)==-1) place.downvoters.push(name);

    var index = place.upvoters.indexOf(name);
    if(index!=-1) place.upvoters.splice(index, 1);
    votes--;

    db.get('places').find({lobby: req.body.lobby, link: req.body.link})
                    .assign({votes: votes, upvoters: place.upvoters, downvoters: place.downvoters})
                    .write();
  }

  res.json({resp: true});
});

// unarchiving a place
app.post('/restore', function (req, res) {
  var place = db.get('places')
                    .find({lobby: req.body.lobby, link: req.body.link})
                    .value();

  if(!place || !place.archived) {
    return res.json({resp: false});
  }

  db.get('places')
    .find({lobby: req.body.lobby, link: req.body.link})
    .assign({archived: false})
    .write();

  res.json({resp: true});
});

// finding the airbnb id
// app.get('/get-id', function (req, res) {
//   var m = req.query.url.match(/\d+/g)
//   res.json({resp: m[0]});
// });