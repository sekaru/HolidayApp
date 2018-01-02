const AWS = require('aws-sdk');
const dynamo = require('./dynamodb');

module.exports.get = (params, callback) => {
  dynamo.get(params, (err, result) => {
    if(err) {
      console.error(err);
      return callback(err);
    }

    return callback(null, result);
  });
}

module.exports.create = (params, callback) => {
  dynamo.put(params, (err, result) => {
    if(err) {
      console.error(err);
      return callback(err);
    }

    return callback(null, result);
  });
}

module.exports.list = (params, callback) => {
  dynamo.scan(params, (err, result) => {
    if(err) {
      console.error(err);
      return callback(err);
    }

    return callback(null, result);
  });
}

module.exports.updatePlace = (place, callback) => {
  const params = {
    TableName: process.env.PLACES_TABLE,
    Key: {
      id: place.id
    },
    UpdateExpression: "set image=:i, price=:p, #desc=:d, archived=:a, votes=:v, upvoters=:uv, downvoters=:dv, latlng=:ll",
    ExpressionAttributeNames: {
      "#desc": "desc"
    },
    ExpressionAttributeValues:{
        ":i": place.image,
        ":p": place.price,
        ":d": place.desc,
        ":a": place.archived,
        ":v": place.votes,        
        ":uv": place.upvoters,
        ":dv": place.downvoters,
        ":ll": place.latlng
    },
    ReturnValues:"UPDATED_NEW"
  }

  dynamo.update(params, (err, result) => {
    if(err) {
      console.error(err);
      return callback(err);
    }

    return callback(null, result);
  });
}

module.exports.delete = (params, callback) => {
  dynamo.delete(params, (err, result) => {
    if(err) {
      console.error(err);
      return callback(err);
    }

    return callback(null, result);
  });
}