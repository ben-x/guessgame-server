'use strict';

import {formatResponse} from '../utils/formatter';
import {Message, Chat, Game} from '../models';
import {
    HTTP_OK,
    HTTP_BAD_REQUEST,
    HTTP_UNATHORIZED
} from '../utils/http-status-code';
import {
    ExceptionCode,
    AuthorizationExceptionCode
} from '../exceptions/code';

/**
 *
 * @param {Object} data
 * @param {String} data.sender
 * @param {String} data.chat
 * @param {String} data.text
 * @param {Date} data.sentAt
 * @param {Object} socket
 * @param {Object} io
 */
export function newMessageHandler(data, socket, io) {
    const {sender, chat, text, sentAt, meta} = data;

    Message.create({
        sender,
        chat,
        text,
        sentAt,
        meta,
    }).then((newMessage) => {
        // notify everyone of a new message
        io.emit('new-message-logged', {chat: newMessage.chat});

        // process question if current message is a question to a game
        if (newMessage.meta) {
            if (newMessage.meta.question === true) {
                addQuestionToGame(meta.gameId, newMessage._id).then((savedGame) => {
                    io.emit('question-asked', {
                        chat: newMessage.chat, gameId: newMessage.meta.gameId
                    });
                });
            }

            if (newMessage.meta.answer === true) {
                addAnswerToGame({
                    gameId: newMessage.meta.gameId,
                    answerId: newMessage._id,
                    questionId: newMessage.meta.questionId
                }).then((savedGame) => {
                    io.emit('question-answered', {
                        chat: newMessage.chat,
                        gameId: newMessage.meta.gameId,
                        questionId: newMessage.meta.questionId
                    });
                });
            }
        }
    }).catch((error) => {
        // notify the sender there was an error
        socket.emit('save-message-error', {message: error.message});
    });
}

/**
 * @desc updates the questions of a game
 * @param {String} gameId
 * @param {String} messageId
 * @return {Promise<Game>}
 */
function addQuestionToGame(gameId, messageId) {
    return Game.findById(gameId).then((game) => {
        if (!game) throw new Error('Game not found');
        if (game.questions.length >= 20) throw new Error('Maximum number of questions exceeded');
        game.questions.push({question: messageId});
        return game.save();
    });
}

/**
 * @desc updates the answers of a game
 * @param {String} gameId
 * @param {String} answerId
 * @param {String} questionId
 * @return {Promise<Game>}
 */
function addAnswerToGame({gameId, answerId, questionId}) {
    return Game.findById(gameId).then((game) => {
        if (!game) throw new Error('Game not found');

        const idx = game.questions.findIndex((item) => item.question.toString() === questionId);

        if (idx === -1) {
            throw new Error('Question not found');
        }

        game.questions[idx]['answer'] = answerId;
        return game.save();
    });
}

/**
 * @desc get messages
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response>}
 */
export function getMessageCtrl(req, res) {
    if (!req.session) {
        return res.status(HTTP_UNATHORIZED)
            .json(formatResponse(AuthorizationExceptionCode, 'Please sign in first'));
    }

    const {chat} = req.query;
    const player = req.session.player;
    const query = {};

    if (chat && player.chats.includes(chat)) {
        query.chat = chat;
    } else {
        query.chat = {$in: player.chats};
    }

    Message.find(query).then((messages) => {
        res.status(HTTP_OK).json(formatResponse(1, 'ok', messages));
    }).catch((error) => {
        res.status(HTTP_BAD_REQUEST).json(formatResponse(ExceptionCode, error.message));
    });
}

/**
 * @desc get chats of a logged in user
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response>}
 */
export function getChatCtrl(req, res) {
    if (!req.session) {
        return res.status(HTTP_UNATHORIZED)
            .json(formatResponse(AuthorizationExceptionCode, 'Please sign in first'));
    }

    const player = req.session.player;
    const query = {};

    query.players = {$in: player._id};

    Chat.find(query).populate('players').then((chats) => {
        res.status(HTTP_OK).json(formatResponse(1, 'ok', chats));
    }).catch((error) => {
        res.status(HTTP_BAD_REQUEST).json(formatResponse(ExceptionCode, error.message));
    });
}
