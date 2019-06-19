'use strict';

import {join} from 'path';
import createError from 'http-errors';
import express from 'express';
import {json, urlencoded} from 'body-parser';
import {ResourceNotFoundException} from './exceptions';
import morgan from 'morgan';
import favicon from 'serve-favicon';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectMongoSession from 'connect-mongodb-session';
import routes from './routes';
import sessionConfig from './configs/session';

/**
 * @desc factory for generating an express app
 */
class App {
    /**
     *
     */
    constructor() {
        this.express = express();
        this.configureApp();
        this.mountSession({
            mongodbURI: sessionConfig.storage.mongo.uri,
            collectionName: sessionConfig.storage.mongo.collection,
            secret: sessionConfig.secret,
            enableHTTPS: sessionConfig.enableHTTPS,
            domain: sessionConfig.domain,
            duration: sessionConfig.domain
        });
        this.mountErrorHandlers();
    }

    /**
     * @private
     * @desc configure general app requirement
     * @return {void}
     */
    configureApp() {
        this.express.use(favicon(join(__dirname, '../public', 'favicon.ico')));
        this.express.use(morgan('dev'));
        this.express.use(json());
        this.express.use(urlencoded({extended: true}));
        this.express.use(cookieParser());
        this.express.use(express.static(join(__dirname, '../', 'public')));
        this.express.use('/', routes);
    }

    /**
     * @private
     * @desc error handlers for the app
     * @return {void}
     */
    mountErrorHandlers() {
        // catch 404 and forward to error handler
        this.express.use((req, res, next) => {
            next(createError(404));
        });

        // // error handler
        this.express.use((err, req, res, next) => {
            res.status(err.status || 500).json(err.message);
        });
    }

    /**
     * @private
     * @desc this method setup production ready session management
     * @param {object} arg
     * @param {string} arg.mongodbURI mongodb compatible url
     * @param {string} arg.collectionName the name of the mongodb collection
     * where the session records would be stored
     * @param {string} arg.secret
     * @param {boolean} arg.enableHTTPS defaults to true
     * @param {string} arg.domain the domain of the app where this session should be active
     * @param {BigInteger} arg.duration the duration in milliseconds of the age of the session
     * @return {void}
     * @api private
     */
    mountSession(arg) {
        // const Store = connectMongoSession(session);

        // const sessionStore = new Store({
        //     uri: arg.mongodbURI,
        //     collection: arg.collectionName
        // });

        this.express.use(session({
            secret: arg.secret,
            cookie: {
                maxAge: arg.duration,
                secure: arg.enableHTTPS,
                domain: arg.domain,
                httpOnly: false
            },
            // store: sessionStore,
            resave: true,
            saveUninitialized: true,
            unset: 'destroy'
        }));
    }
}

export default new App().express;
