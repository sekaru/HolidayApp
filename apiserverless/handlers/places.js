'use strict';

const ImageResolver = require('image-resolver');
const db = require('../db');
const _ = require('lodash');
const uuid = require('uuid');
const headers = require('./headers');

module.exports.getplaces = (event, context, callback) => {
  // get a lobby's places
  let res = {
    statusCode: 200,
    headers: headers,
    body: {}
  };

  let sort = '';
  const ascSorts = [1, 3, 4];

  switch(parseInt(event.queryStringParameters.sort)) {
    case 0:
    case 1:
      sort = 'timestamp';
      break;
    case 2:
    case 3:
      sort = 'votes';
      break;
    case 4:
      sort = 'price';
      break;
  }

  db.list({
    TableName: process.env.PLACES_TABLE
  }, (err, result) => {
    if(err) return callback(err);

    let places = result.Items;
    if(places.length===0) {
      res.body = JSON.stringify(places);          
      return callback(null, res);
    }
    
    places = _.filter(places, {lobby: event.queryStringParameters.lobby});
    places = _.sortBy(places, sort);

    // price
    if(sort==='price') places = sortPrice(places);
    
    // ascending sort
    if(ascSorts.indexOf(parseInt(event.queryStringParameters.sort))!==-1) places.reverse();

    res.body = JSON.stringify(places);    

    callback(null, res);     
  });
};

function sortPrice(array) {
  return array.sort((a, b) => {
    let aa = a.price.startsWith("Scale") ? a.price.split("Scale")[1].length*10 : a.price.substring(1);
    let bb = b.price.startsWith("Scale") ? b.price.split("Scale")[1].length*10 : b.price.substring(1);

    let x = parseInt(aa);
    let y = parseInt(bb);

    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

function getPlace(lobby, link, callback) {
  db.list({
    TableName: process.env.PLACES_TABLE
  }, (err, result) => {
    if(err) return callback(err);

    const places = result.Items;
    const place = _.find(places, {lobby: lobby, link: link});

    callback(null, place)
  });
}

module.exports.addplace = (event, context, callback) => {
  let body = JSON.parse(event.body);

  let res = {
    statusCode: 200,
    headers: headers,
    body: {}
  };

  if(!body.link || body.link.length<=7 || !body.price || body.price.length<=1 || !body.author || !body.lobby) {
    res.body = JSON.stringify({resp: false, err: "err_missing_details", msg: "You haven't filled in all the required fields"});
    return callback(null, res);
  }

  getPlace(body.lobby, body.link, (err, place) => {
    if(err) return callback(err, null);

    const fallback = "https://unsplash.it/1280/720?image=" + (10 + Math.floor(Math.random()*200));

    if(place) {
      res.body = JSON.stringify({resp: false, err: 'err_duplicate_place', msg: 'That place already exists in your lobby!'});
      return callback(null, res);
    } else {
      const place = {
        id: uuid.v4(),
        lobby: body.lobby,
        author: body.author,
        link: body.link,
        price: body.price,
        desc: body.desc,
        votes: 1,
        upvoters: [body.author],
        downvoters: [],
        image: body.image,
        latlng: body.latlng || {},
        archived: false,
        timestamp: new Date().getTime()
      }

      if(!place.image) {
        let resolver = new ImageResolver();
        let resolved = false;
        
        resolver.register(new ImageResolver.FileExtension());
        resolver.register(new ImageResolver.MimeType());
        resolver.register(new ImageResolver.Opengraph());
        resolver.register(new ImageResolver.Webpage());

        resolver.resolve(body.link, (result) => {
          place.image = result ? result.image : fallback;
          if(!resolved) {
            addPlace(place, res, callback);
            resolved = true;
          }
        });
      } else {
        addPlace(place, res, callback);
      }    
    }
  });
}

function addPlace(place, res, callback) {
  db.create({
    TableName: process.env.PLACES_TABLE,
    Item: place
  }, (err, result) => {
    if(err) return callback(err);
    
    res.body = JSON.stringify({resp: true});
    console.log("Added new place: " + JSON.stringify(place));
    callback(null, res);
  });
}

module.exports.delete = (event, context, callback) => {
  handlePlaceState(event, 0, callback);
}

module.exports.restore = (event, context, callback) => {
  handlePlaceState(event, 1, callback);
}

function handlePlaceState(event, mode, callback) {
  let body = JSON.parse(event.body);

  let res = {
    statusCode: 200,
    headers: headers,
    body: {}
  };

  if(!body.lobby || !body.link) {
    res.body = JSON.stringify({resp: false, err: "err_missing_details", msg: "You haven't filled in all the required fields"});
    return callback(null, res);
  }

  getPlace(body.lobby, body.link, (err, place) => {
    if(err) return callback(err);

    if(!place) {
      res.statusCode = 404;
      res.body = JSON.stringify({resp: false, err: "err_place_doesnt_exist", msg: "That place doesn't exist"});
      return callback(null, res);
    }

    mode == 0 ? archivePlace(place, res, callback) : restorePlace(place, res, callback);
  });
}

function archivePlace(place, res, callback) {
  if(place.archived) {
    db.delete({
      TableName: process.env.PLACES_TABLE,
      Key: {
        id: place.id
      }
    }, (err, result) => {
      if(err) return callback(err);

      console.log("Deleted " + place.link + " in " + place.lobby);
      res.body = JSON.stringify({resp: true});
      callback(null, res);
    });
  } else {
    place.archived = true;

    db.updatePlace(place, (err, result) => {
      if(err) return callback(err);    

      console.log("Archived " + place.link + " in " + place.lobby);
      res.body = JSON.stringify({resp: true});
      callback(null, res);
    });
  }
}

function restorePlace(place, res, callback) {
  if(!place.archived) {
    res.body = JSON.stringify({resp: false});
    callback(null, res);      
  } else {
    place.archived = false;

    db.updatePlace(place, (err, result) => {
      if(err) return callback(err);    

      console.log("Restored " + place.link + " in " + place.lobby);
      res.body = JSON.stringify({resp: true});
      callback(null, res);
    });
  }
}

module.exports.vote = (event, context, callback) => {
  let body = JSON.parse(event.body);

  let res = {
    statusCode: 200,
    headers: headers,
    body: {}
  };

  if(!body.lobby || !body.link || body.type===undefined || !body.name) {
    res.body = JSON.stringify({resp: false, err: "err_missing_details", msg: "You haven't filled in all the required fields"});
    return callback(null, res);
  }

  getPlace(body.lobby, body.link, (err, place) => {
    if(err) return callback(err);

    if(!place) {
      res.statusCode = 404;
      res.body = JSON.stringify({resp: false, err: "err_place_doesnt_exist", msg: "That place doesn't exist"});
      return callback(null, res);
    }

    if(body.type===0) { // upvote
      if(place.upvoters.indexOf(body.name)===-1) {
        place.upvoters.push(body.name);
      } else {
        res.body = JSON.stringify({resp: false});
        return callback(null, res);
      }
  
      const index = place.downvoters.indexOf(body.name);
      if(index!==-1) place.downvoters.splice(index, 1);
      place.votes++;
  
      db.updatePlace(place, (err, result) => {
        if(err) return callback(err);
        
        res.body = JSON.stringify({resp: true});        
        callback(null, res);
      });
    } else if(body.type===1) { // downvote
      if(place.downvoters.indexOf(body.name)===-1) {
        place.downvoters.push(body.name);
      } else {
        res.body = JSON.stringify({resp: false});
        return callback(null, res);
      }

      const index = place.upvoters.indexOf(body.name);
      if(index!==-1) place.upvoters.splice(index, 1);
      place.votes--;
  
      db.updatePlace(place, (err, result) => {
        if(err) return callback(err);
        
        res.body = JSON.stringify({resp: true});        
        callback(null, res);
      });
    }
  });
}

module.exports.updateplace = (event, context, callback) => {
  let body = JSON.parse(event.body);

  let res = {
    statusCode: 200,
    headers: headers,
    body: {}
  };

  if(!body.lobby || !body.link) {
    res.body = JSON.stringify({resp: false, err: "err_missing_details", msg: "You haven't filled in all the required fields"});
    return callback(null, res);
  }

  getPlace(body.lobby, body.link, (err, place) => {
    if(err) return callback(err);

    if(!place) {
      res.statusCode = 404;
      res.body = JSON.stringify({resp: false, err: "err_place_doesnt_exist", msg: "That place doesn't exist"});
      return callback(null, res);
    }

    place.image = body.image || place.image;
    place.price = body.price || place.price;
    place.desc = body.desc || place.desc;
    place.latlng = body.latlng || place.latlng;
    db.updatePlace(place, (err, result) => {
      if(err) return callback(err);
      
      res.body = JSON.stringify({resp: true});        
      callback(null, res);
    });
  });
}