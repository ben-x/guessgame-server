'use strict';
import {GameStatus} from '../configs/status';

module.exports = function(mongoose, connection) {
    const Schema = mongoose.Schema;

    const QuestionSchema = new Schema({
        question: {type: Schema.Types.ObjectId, ref: 'Message'},
        answer: {type: Schema.Types.ObjectId, ref: 'Message'}
    }, {
        _id: false
    });

    const GameSchema = new Schema({
        player1: {type: Schema.Types.ObjectId, ref: 'Player', required: true, index: true},
        player2: {type: Schema.Types.ObjectId, ref: 'Player', required: true, index: true},
        chat: {type: Schema.Types.ObjectId, ref: 'Chat'},
        questions: [QuestionSchema],
        actual_word: {type: Schema.Types.String, required: true},
        guessed_word: {type: Schema.Types.String},
        winner: {type: Schema.Types.ObjectId, ref: 'Player'},
        loser: {type: Schema.Types.ObjectId, ref: 'Player'},
        meta: {type: Schema.Types.Object},
        status: {
            type: Schema.Types.String,
            enum: Object.values(GameStatus),
            default: GameStatus.Active
        }
    }, {
        collection: 'games',
        timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}
    });

    return connection.model('Game', GameSchema);
};
