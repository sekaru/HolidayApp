'use strict';

const db = require('../db');
const _ = require('lodash');
const headers = require('./headers');

module.exports.lobbycode = (event, context, callback) => {
  // generate a lobby code (but don't make it yet)
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let len = 5;
  let code = "";

  db.list({
    TableName: process.env.LOBBIES_TABLE
  }, (err, result) => {
    const lobbies = result.Items;

    do {
      code = "";
      for(let i=0; i<len; i++) {
        code += possible.charAt(Math.floor(Math.random() * possible.length));
      }
    } while(_.find(lobbies, {id: code}));
  
    const res = {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({
        code: code
      }),
    };
  
    callback(null, res);
  });
};

module.exports.lobby = (event, context, callback) => {
  // check if a lobby exists
  db.get({
    TableName: process.env.LOBBIES_TABLE,
    Key: {
      id: event.queryStringParameters.id,
    },
  }, (err, result) => {
    if(err) return callback(err);

    let res = {
      statusCode: 200,
      headers: headers,
      body: {}
    };

    if(Object.keys(result).length===0) {
      res.statusCode = 404;
      res.body = JSON.stringify({resp: false, err: "err_lobby_not_found", msg: "Couldn't find that lobby"});
    } else {
      res.body = JSON.stringify({resp: true, code: result.Item.id});         
    }

    callback(null, res);     
  });
};

module.exports.makelobby = (event, context, callback) => {
  // make a lobby
  const id = JSON.parse(event.body).id;
  
  db.create({
    TableName: process.env.LOBBIES_TABLE,
    Item: {
      id: id,
    },
  }, (err, result) => {
    if(err) return callback(err);

    const res = {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify({resp: true})
    };
    console.log("Created lobby ID: " + id);
    
    callback(null, res);     
  });
};