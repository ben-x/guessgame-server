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
        useCreateIndex: true
    }
};

/**
 * @desc postgres database configuration requirements
 */
export const postgres = {
    database: process.env.POSTGRES_DATABASE,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    options: {
        pool: {
            max: 5,
            min: 0,
            idle: 5000,
            evict: 5000
        },
        host: process.env.POSTGRES_HOST,
        dialect: 'postgres',
        timezeone: 'Africa/Lagos'
    }
};
