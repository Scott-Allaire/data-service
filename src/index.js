import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import http from 'http';
import mongodb from 'mongodb';
import morgan from 'morgan';
import path from 'path';

import config from './config.json';
import data from './data';

var app = express();
app.server = http.createServer(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// log requests to the console
app.use(morgan('dev'));

// CORS middleware
app.use(cors({
    exposedHeaders: config.corsHeaders
}));

app.use('/data', data(app));

let port = process.env.PORT || config.port || 8080;

mongodb.MongoClient.connect(config.mongoUrl, function (err, db) {
    if (err) {
        console.log(err);
    } else {
        app.set('mongo', db);

        app.server.listen(port);
        console.log(`Data service listening on port ${port}`);
    }
});

export default app;