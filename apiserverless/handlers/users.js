'use strict';

const bcrypt = require('bcryptjs');
const randomColor = require('randomcolor');
const db = require('../db');
const _ = require('lodash');
const uuid = require('uuid');
const headers = require('./headers');

module.exports.getusers = (event, context, callback) => {
  // get users from a particular lobby
  db.list({
    TableName: process.env.USERS_TABLE
  }, (err, result) => {
    if(err) return callback(err);

    let res = {
      statusCode: 200,
      headers: headers,
      body: {}
    };

    let users = result.Items;
    let lobbyUsers = [];
    for(let i=0; i<users.length; i++) {
      if(users[i].lobby===event.queryStringParameters.id) {
        lobbyUsers.push(users[i]);
      }
    }

    res.body = JSON.stringify(lobbyUsers);

    callback(null, res);     
  });
};

function getUser(lobby, name, callback) {
  // get a single user
  db.list({
    TableName: process.env.USERS_TABLE
  }, (err, result) => {
    if(err) return callback(err);

    const users = result.Items;
    const user = _.find(users, {lobby: lobby, name: name});

    callback(null, user);     
  });
}

module.exports.getcolour = (event, context, callback) => {
  // get a user's colour
  db.list({
    TableName: process.env.USERS_TABLE
  }, (err, result) => {
    if(err) return callback(err);

    let res = {
      statusCode: 200,
      headers: headers,
      body: {}
    };

    let users = result.Items;
    let colour = _.find(users, {lobby: event.queryStringParameters.lobby, name: event.queryStringParameters.name}).colour;
    res.body = JSON.stringify({resp: colour});

    callback(null, res);     
  });
};

module.exports.register = (event, context, callback) => {
  // register a user
  const body = JSON.parse(event.body);

  let res = {
    statusCode: 200,
    headers: headers,
    body: {}
  };

  if(!body.lobby || !body.name || !body.pass) {
    res.statusCode = 400;
    res.body = JSON.stringify({resp: false, err: "err_missing_details", msg: "All the fields are required"});
    return callback(null, res);
  }

  getUser(body.lobby, body.name, (err, user) => {
    if(err) return callback(err);

    if(user) {
      res.body = JSON.stringify({resp: false, err: 'err_duplicate_name', msg: 'That name is taken'});
      return callback(null, res);
    }

    bcrypt.hash(body.pass, 10, (err, hash) => {
      const colour = randomColor();
      const user = {
        id: uuid.v4(),
        lobby: body.lobby, 
        name: body.name, 
        pass: hash, 
        colour: colour
      }

      db.create({
        TableName: process.env.USERS_TABLE,
        Item: user,
      }, (err, result) => {
        if(err) return callback(err);
    
        console.log("Added user " + user.name + " to lobby " + user.lobby);

        res.body = JSON.stringify({resp: true, user: user});
        callback(null, res);     
      });
    });
  });
};

module.exports.login = (event, context, callback) => {
  // logging in
  const body = JSON.parse(event.body);

  let res = {
    statusCode: 200,
    headers: headers,
    body: {}
  };

  if(!body.pass) {
    res.body = JSON.stringify({resp: false, err: "err_missing_details", msg: "You need to enter a password"});
    return callback(null, res);
  }

  getUser(body.lobby, body.name, (err, user) => {
    if(err) return callback(err);

    if(user) {
      bcrypt.compare(body.pass, user.pass, (err, result) => {
        if(result && !err) {
          console.log("User logged in: " + JSON.stringify({lobby: body.lobby, name: body.name}));
          res.body = JSON.stringify({resp: true});
        } else {
          res.body = JSON.stringify({resp: false, err: "err_wrong_pass", msg: "Incorrect password"});
        }

        callback(null, res);
      });
    } else {
      res.body = JSON.stringify({resp: false, err: "err_user_doesnt_exist", msg: "User doesn't exist"});
      callback(null, res);      
    }
  });
}

module.exports.cookielogin = (event, context, callback) => {
  // logging in
  const body = JSON.parse(event.body);

  let res = {
    statusCode: 200,
    headers: headers,
    body: {}
  };

  if(!body.lobby || !body.name) {
    res.body = JSON.stringify({resp: false, err: "err_missing_details", msg: "Nice try!"});
    return callback(null, res);
  }

  getUser(body.lobby, body.name, (err, user) => {
    if(err) return callback(err);

    if(user) {
      res.body = JSON.stringify({resp: true});
      console.log("User logged in (via cookie): " + JSON.stringify(body));
    } else {
      res.body = JSON.stringify({resp: false, err: "err_user_doesnt_exist", msg: "User doesn't exist"});
    }
    callback(null, res);          
  });
}

