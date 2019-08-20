import mongoose from 'mongoose';
import {mongo} from '../configs/db';
import bluebird from 'bluebird';

mongoose.Promise = bluebird;
const conn = mongoose.createConnection(mongo.uri, mongo.options);

conn.once('open', function callback() {
    logger.log('db connection open');
});

const PlayerModel = require('./player')(mongoose, conn);
const GameModel = require('./game')(mongoose, conn);
const MessageModel = require('./message')(mongoose, conn);
const ChatModel = require('./chat')(mongoose, conn);

module.exports = {
    Player: PlayerModel,
    Game: GameModel,
    Message: MessageModel,
    Chat: ChatModel,
    mongoose: mongoose
};
