'use strict';

/**
 *
 */
const session = {
    secret: process.env.SESSION_SECRET,
    enableHTTPS: process.env.ENABLE_HTTPS,
    domain: process.env.DOMAIN,
    duration: parseInt(process.env.SESSION_DURATION), // in milli seconds
    storage: {
        mongo: {
            uri: process.env.MONGODB_URI,
            collection: 'collection'
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
