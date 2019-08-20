'use strict';

import './configs/global';
import appConfig from './configs/app';
import * as http from 'http';
import app from './app';
import socketIO from 'socket.io';
import {newMessageHandler} from './controllers/chat';

const port = parseInt(appConfig.port);
const server = http.createServer(app);
const io = socketIO(server);

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

io.use((socket, next) => {
    // console.log(socket.handshake.headers.cookie);
    const token = socket.handshake.query.token;
    if (token === 'flex') {
        return next();
    }
    return next(new Error('authentication error'));
});

io.on('connection', function(socket){
    console.log('player connected');

    // io.emit('player-connected', {player: socket});
    socket.on('new-message', function(msg) {
        newMessageHandler(msg, socket, io);
    });

    socket.on('disconnect', function () {
        io.emit('player-disconnected');
    });

    global.GUESS_APP_SOCK = {io: io, socket: socket, timestamp: Date.now()};
});
