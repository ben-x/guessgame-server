'use strict';

module.exports = function(mongoose, connection) {
    const Schema = mongoose.Schema;

    const PlayerSchema = new Schema({
        username: {type: Schema.Types.String, required: true, unique: true},
        bio: {type: Schema.Types.String},
        avatar: {type: Schema.Types.String},
        won: {type: Schema.Types.Number, default: 0},
        lost: {type: Schema.Types.Number, default: 0},
        points: {type: Schema.Types.Number, default: 0},
        meta: {type: Schema.Types.Object},
        chats: [{type: Schema.Types.ObjectId, ref: 'Chat'}]
    }, {
        collection: 'players',
        timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}
    });

    return connection.model('Player', PlayerSchema);
};
