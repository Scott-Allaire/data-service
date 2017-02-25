import express from 'express';
import _ from 'lodash';
import uuid from 'uuid/v1';
import md5 from 'md5';

var router = express.Router();

export default (app) => {
    // create a new time series
    router.post('/create', (req, res) =>{
        console.log('CREATE', req.body);

        let privateKey = uuid();
        let publicKey = md5(privateKey);

        // create new series

        // return keys
        res.status(200);
        res.json({
            public: publicKey,
            private: privateKey
        });
    });

    // list data from a collection
    router.get('/:collection', (req, res) => {
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
            .toArray(function (err, docs) {

                if (err) {
                    res.status(500);
                    res.json({message: err});
                } else {
                    res.json(docs);
                }
            });
    });

    // store data in a collection
    router.post('/:collection', (req, res) => {
        var collectionName = req.params.collection;
        console.log('POST', collectionName, req.body);

        var db = app.get('mongo');

        var collection = db.collection(collectionName);

        if (_.isArray(req.body)) {
            _.each(req.body, (doc) => {
                doc.created = new Date();
            });

            collection.insertMany(req.body, (err, result) => {
                if (err) {
                    res.status(500);
                    res.json({message: err});
                } else {
                    res.json({docs: result.result.n});
                }
            });
        } else {
            req.body.created = new Date();

            collection.insertOne(req.body, (err, result) => {
                if (err) {
                    res.status(500);
                    res.json({message: err});
                } else {
                    res.json({docs: result.result.n});
                }
            });
        }
    });

    return router;
}

