
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongodb = require('mongodb');
var _ = require('lodash');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// log requests to the console
app.use(morgan('dev'));

// CORS middleware
var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
}
app.use(allowCrossDomain);

// list data from a collection
app.get('/data/:collection', function (req, res) {
  var collection = req.params.collection;
  var page = req.param('page') || 0;
  var pageSize = req.param('size') || 20;
  console.log('GET', collection);

  var db = app.get('mongo');

  var collection = db.collection(collection);
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
  var collection = req.params.collection;
  console.log('POST', collection, req.body);

  var db = app.get('mongo');

  var collection = db.collection(collection);

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

app.set('port', process.env.PORT || 5000);

var url = 'mongodb://localhost:27017/data';
mongodb.MongoClient.connect(url, function(err, db) {
  if (err) {
    console.log(err);
  } else {
    app.set('mongo', db);

    var server = app.listen(app.get('port'), function () {
      console.log('Data service listening on port ' + server.address().port);
    });
  }
});
