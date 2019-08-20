'use strict';

/**
 * @desc mongo database configuration requirements
 */
export const mongo = {
    uri: process.env.MONGODB_URI,
    options: {
        socketTimeoutMS: 0,
        keepAlive: true,
        reconnectTries: 20,
        poolSize: 5,
        promiseLibrary: Promise,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    }
};
