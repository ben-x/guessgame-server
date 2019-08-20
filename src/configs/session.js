'use strict';

/**
 *
 */
const session = {
    secret: process.env.SESSION_SECRET,
    enableHTTPS: false, // process.env.ENABLE_HTTPS,
    domain: process.env.DOMAIN,
    duration: parseInt(process.env.SESSION_DURATION), // in milli seconds
    storage: {
        mongo: {
            uri: process.env.MONGODB_URI,
            collection: 'sessions'
        },
        postgres: {

        },
        file: {
            name: ''
        },
        disk: {

        }
    }
};

export default session;
