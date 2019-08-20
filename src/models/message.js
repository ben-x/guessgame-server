'use strict';

export const MessageType = {
    text: 'text',
    document: 'document',
    image: 'image',
    music: 'music',
    video: 'video'
};

module.exports = function(mongoose, connection) {
    const Schema = mongoose.Schema;

    const MessageSchema = new Schema({
        sender: {type: Schema.Types.ObjectId, ref: 'Player', index: true, sparse: true},
        chat: {type: Schema.Types.ObjectId, ref: 'Chat', index: true},
        type: {
            type: Schema.Types.String,
            num: Object.values(MessageType),
            default: MessageType.text
        },
        text: {type: Schema.Types.String},
        sentAt: {type: Schema.Types.Date, default: Date.now()}, // time sent from the sender device
        loggedAt: {type: Schema.Types.Date, default: Date.now()}, // time reached the server
        meta: {type: Schema.Types.Object}
    }, {
        collection: 'messages',
        timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}
    });

    return connection.model('Message', MessageSchema);
};
