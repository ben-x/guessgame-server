'use strict';

import './configs/globals';
import * as http from 'http';
import app from './app';

const port = parseInt(process.env.PORT);
const server = http.createServer(app);

server.listen(port);

server.on('listening', () =>{
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    logger.log(`server is listening on ${bind}`);
});

server.on('error', (error) => {
    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    /* eslint-disable */
    switch (error.code) {
        case 'EACCES':
            logger.error(bind + ' requires elevated privileges', null, 'error');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
    /* eslint-disable */
});
