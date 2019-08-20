'use strict';

const Types = {
    Individual: 'individual',
    Group: 'group'
};

module.exports = function(mongoose, connection) {
    const Schema = mongoose.Schema;

    const ChatSchema = new Schema({
        players: [{type: Schema.Types.ObjectId, ref: 'Player'}],
        active: {type: Schema.Types.Boolean, default: true},
        type: {type: Schema.Types.String, enum: Object.values(Types), default: Types.Individual},
        meta: {type: Schema.Types.Object}
    }, {
        collection: 'chats',
        timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}
    });

    return connection.model('Chat', ChatSchema);
};
