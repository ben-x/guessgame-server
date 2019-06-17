const config = require('dotenv');
const bluebird = require('bluebird');
const mongoose = require('mongoose');
const Logger = require('../utils/logger');

// load environment variables from .env file into the app and make it globally available as an
// extension of process.env
config();

// override es6 default promise with bluebird promise
global.Promise = bluebird;

// use blue as the default mongoose promise library
mongoose.Promise = bluebird;

global.logger = new Logger({
    console: {
        enabled: true,
        level: 'debug'
    },
    file: {
        filename: '../app.log'
    }
});
