import socketIO from 'socket.io';
import {newMessageHandler} from './controllers/chat';
import Promise from 'bluebird';

function setSocket(server) {
    return new Promise((resolve, reject) => {
        const io = socketIO(server);

        io.use((socket, next) => {
            const token = socket.handshake.query.token;
            if (token === 'flex') {
                return next();
            }
            return next(new Error('authentication error'));
        });

        io.on('connection', function(socket){
            logger.log('player connected');

            // io.emit('player-connected', {player: socket});
            socket.on('new-message', function(msg) {
                newMessageHandler(msg, socket, io);
            });

            socket.on('disconnect', function() {
                io.emit('player-disconnected');
            });

            resolve({socket, io, timestamp: Date.now()});
        });
    });
}


class Singleton {
    constructor(server) {
        if (!Singleton.instance) {
            setSocket(server).then((inst) => {
                Singleton.instance = inst;
            });
        }
    }

    getInstance() {
        return Singleton.instance;
    }
}


export default Singleton;
