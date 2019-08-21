'use strict';

import {join} from 'path';
import createError from 'http-errors';
import express from 'express';
import {json, urlencoded} from 'body-parser';
import morgan from 'morgan';
import favicon from 'serve-favicon';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import connectMongoSession from 'connect-mongodb-session';
import routes from './routes';
import sessionConfig from './configs/session';
import appConfig from './configs/app';

/**
 * @desc factory for generating an express app
 */
export class App {
    /**
     *
     */
    constructor() {
        this.express = express();
        this.configureApp();
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
        // this.express.use(cookieParser());
        this.mountSession({
            mongodbURI: sessionConfig.storage.mongo.uri,
            collectionName: sessionConfig.storage.mongo.collection,
            secret: sessionConfig.secret,
            enableHTTPS: sessionConfig.enableHTTPS,
            domain: sessionConfig.domain,
            duration: sessionConfig.duration,
            isProduction: appConfig.env === 'production'
        });
        this.express.use(express.static(join(__dirname, '../', 'public')));
        this.express.use(compression());
        this.express.use(cors({
            origin: [sessionConfig.origin],
            methods: 'GET,PUT,POST,DELETE',
            allowedHeaders: 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept',
            credentials: true,
            optionsSuccessStatus: 204,
        }));
        // this.express.use(helmet());
        this.express.use((req, res, next) => {
            logger.log('SESSION', req.session.id);
            next();
        });
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
     * @param {boolean} arg.isProduction signifies if we are in production environment
     * @return {void}
     * @api private
     */
    mountSession(arg) {
        const sessionConf = {
            secret: arg.secret,
            cookie: {
                maxAge: arg.duration,
                secure: arg.enableHTTPS,
                domain: arg.domain,
                httpOnly: false,
                // sameSite: false
            },
            resave: true,
            saveUninitialized: true,
            unset: 'destroy'
        };

        // if (arg.isProduction) {
        const Store = connectMongoSession(session);
        sessionConf.store = new Store({
            uri: arg.mongodbURI,
            collection: arg.collectionName
        });
        // }

        this.express.use(session(sessionConf));
    }
}

export default new App().express;
