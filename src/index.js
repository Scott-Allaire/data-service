
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import morgan from 'morgan';
import mongodb from 'mongodb';
import _ from 'lodash';

import config from './config.json';

var app = express();
app.server = http.createServer(app);

app.use(bodyParser.json({
    limit : config.bodyLimit
}));

// log requests to the console
app.use(morgan('dev'));

// CORS middleware
app.use(cors({
    exposedHeaders: config.corsHeaders
}));

// list data from a collection
app.get('/data/:collection', function (req, res) {
  let collectionName = req.params.collection;
  let page = req.param('page') || 0;
  let pageSize = req.param('size') || 20;
  console.log('GET', collectionName);

  var db = app.get('mongo');

  var collection = db.collection(collectionName);
  collection.find({})
      .sort({created: -1})
      .skip(parseInt(page) * parseInt(pageSize))
      .limit(parseInt(pageSize))
      .toArray(function(err, docs) {

    if (err) {
      res.status(500);
      res.json({ message: err });
    } else {
      res.json(docs);
    }
  });
});

// store data in a collection
app.post('/data/:collection', function (req, res) {
  var collectionName = req.params.collection;
  console.log('POST', collectionName, req.body);

  var db = app.get('mongo');

  var collection = db.collection(collectionName);

  if (_.isArray(req.body)) {
    _.each(req.body, function(doc) {
      doc.created = new Date();
    });

    collection.insertMany(req.body, function(err, result) {
      if (err) {
        res.status(500);
        res.json({ message: err });
      } else {
        res.json({ docs: result.result.n });
      }
    });
  } else {
    req.body.created = new Date();

    collection.insertOne(req.body, function(err, result) {
      if (err) {
        res.status(500);
        res.json({ message: err });
      } else {
        res.json({ docs: result.result.n });
      }
    });    
  }
});

let port = process.env.PORT || config.port || 8080;

var url = 'mongodb://localhost:27017/data';
mongodb.MongoClient.connect(url, function(err, db) {
  if (err) {
    console.log(err);
  } else {
    app.set('mongo', db);

    app.server.listen(port);
    console.log(`Data service listening on port ${port}`);
  }
});

export default app;