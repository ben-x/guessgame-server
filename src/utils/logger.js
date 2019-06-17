import {createLogger, format, transports} from 'winston';
import * as winstonMongoDB from 'winston-mongodb';

class Logger {
    logger;
    transportArr = [];
    mongodb;

    constructor(options) {
        if (options.console) this.addConsoleToTransport(options.console);
        if (options.file) this.addFileToTransport(options.file);
        if (options.mongodb) this.addMongoDBToTransport(options.mongodb);

        this.logger = createLogger({
            level: Logger.level.info,
            format: format.json(),
            defaultMeta: {app: ''},
            transports: this.transportArr
        });
    }

    log(message, meta = {}, level = Logger.level.info){
        this.logger.log(level, message, meta);
    }

    error(message, meta = {}){
        this.logger.log(Logger.level.error, message, meta);
    }

    warn(message, meta = {}) {
        this.logger.log(Logger.level.warn, message, meta);
    }

    addConsoleToTransport(console) {
        const op = {
            enabled: console.enabled || true,
            name: console.name || 'console',
            level: console.level || Logger.level.info,
            handleExceptions: console.handleException || true,
            json: true,
            format: format.simple()
        };

        this.transportArr.push(new transports.Console(op));
    }

    addFileToTransport(file) {
        const op = {
            name: file.name || 'file',
            level: file.level || Logger.level.warn,
            filename: file.filename,
            format: format.simple()
        };

        this.transportArr.push(new transports.File(op));
    }

    addMongoDBToTransport(mongodb) {
        const op = {
            name: mongodb.name || 'mongodb',
            level: mongodb.level || Logger.level.warn,
            db: mongodb.connectionUrl,
            collection: mongodb.collection || 'logs',
            format: format.simple()
        };

        this.transportArr.push(new winstonMongoDB.MongoDB(op));
    }

    disableTransportByName(transportName) {
        this.logger.remove(transportName);
    }

    getTransport() {
        return this.transportArr;
    }

    static level = {
        info: 'info',
        warn: 'warn',
        error: 'error'
    }
}

export default Logger;
