'use strict';

import {formatResponse} from '../utils/formatter';
import {Player, Chat} from '../models';
import {
    HTTP_OK,
    HTTP_CREATED,
    HTTP_BAD_REQUEST,
    HTTP_SERVER_ERROR,
    HTTP_UNATHORIZED,
    HTTP_UNATHENTICATED
} from '../utils/http-status-code';
import {
    ExceptionCode,
    ResourceAlreadyExitsCode,
    AuthorizationExceptionCode,
    ResourceNotFoundExceptionCode,
} from '../exceptions/code';
import sessionCfg from '../configs/session';

/**
 * @desc start session for player
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response>}
 */
export function signInCtrl(req, res) {
    const username = req.body.username;

    if (!username) {
        return res.status(HTTP_BAD_REQUEST)
            .json(formatResponse(ExceptionCode, 'No username provided'));
    }

    Player.findOne({username: username}).populate('chats').then((player) => {
        if (!player) {
            return res.status(HTTP_UNATHENTICATED)
                .json(formatResponse(ResourceNotFoundExceptionCode, 'Incorrect username'));
        }

        req.session.player = player;
        res.cookie('ASID', req.session.id, {
            maxAge: sessionCfg.duration,
            secure: sessionCfg.enableHTTPS,
            domain: sessionCfg.domain
        });

        return res.status(HTTP_OK).json(formatResponse(1, 'ok', player));
    }).catch((error) => {
        res.status(HTTP_SERVER_ERROR)
            .json(formatResponse(ExceptionCode, 'An error occurred during sign in'));
    });
}

/**
 * @desc ends session for player
 * @param {Request} req
 * @param {Response} res
 * @return {void}
 */
export function logoutCtrl(req, res) {
    req.session.destroy((error) => {
        if (error) {
            return res.status(HTTP_SERVER_ERROR).json(formatResponse(0, 'Unable to end session'));
        }
        res.clearCookie('ASID', {
            secure: sessionCfg.enableHTTPS,
            domain: sessionCfg.domain
        });
        res.status(HTTP_OK).json(formatResponse(1, 'Successfully logged out'));
    });
}

/**
 * @desc register player controller
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response>}
 */
export function registerCtrl(req, res) {
    const {username, bio, avatar} = req.body;

    if (!username || !bio) {
        return res.status(HTTP_BAD_REQUEST)
            .json(formatResponse(ExceptionCode, 'No username or bio provided'));
    }

    Player.create({
        username: username,
        bio: bio,
        avatar: avatar
    }).then((newPlayer) => {
        res.status(HTTP_CREATED).json(formatResponse(1, 'ok', newPlayer));
    }).catch((error) => {
        if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(HTTP_BAD_REQUEST)
                .json(formatResponse(ResourceAlreadyExitsCode, 'Player name already taken'));
        }

        res.status(HTTP_SERVER_ERROR)
            .json(formatResponse(ExceptionCode, 'An error occurred setting you up'));
    });
}

/**
 * @desc get player detail
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response>}
 */
export function getCtrl(req, res) {
    if (!req.session && !req.session.player) {
        return res.status(HTTP_UNATHORIZED)
            .json(formatResponse(AuthorizationExceptionCode, 'Please signin first'));
    }

    const player = req.session.player;
    const {includeChats} = req.query;

    let cmd = Player.findById(player._id);

    if (includeChats) {
        cmd = cmd.populate('chats');
    }

    cmd.then((player) => {
        res.status(HTTP_OK).json(formatResponse(1, 'ok', player));
    }).catch((error) => {
        res.status(HTTP_BAD_REQUEST).json(formatResponse(ExceptionCode, error.message));
    });
}

/**
 * @desc get all players
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response>}
 */
export function getAllCtrl(req, res) {
    if (!req.session && !req.session.player) {
        return res.status(HTTP_UNATHORIZED)
            .json(formatResponse(AuthorizationExceptionCode, 'Please signin first'));
    }
    const {includeChats} = req.query;

    let cmd = Player.find({});

    if (includeChats) {
        cmd = cmd.populate('chats');
    }

    cmd.then((players) => {
        res.status(HTTP_OK).json(formatResponse(1, 'ok', {
            players: players,
            total: players.length
        }));
    }).catch((error) => {
        res.status(HTTP_BAD_REQUEST).json(formatResponse(ExceptionCode, error.message));
    });
}

/**
 * @desc start a new thread with another player
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response>}
 */
export function startChatCtrl(req, res) {
    if (!req.session && !req.session.player) {
        return res.status(HTTP_UNATHORIZED)
            .json(formatResponse(AuthorizationExceptionCode, 'Please signin first'));
    }

    const {playerId} = req.body;

    if (!playerId) {
        return res.status(HTTP_BAD_REQUEST)
            .json(formatResponse(ExceptionCode, 'No playerId supplied'));
    }

    const player = req.session.player;
    const playersToStart = [playerId, player._id.toString()];
    let chat = null;

    Chat.findOne({
        $and: [{players: player._id}, {players: playerId}]
    }).then((foundChat) => {
        if (foundChat) {
            return foundChat;
        }

        return Chat.create({players: playersToStart});
    }).then((newChat) => {
        chat = newChat;
        return Player.updateMany(
            {_id: {$in: playersToStart}},
            {$push: {chats: newChat._id.toString()}}
        );
    }).then((update) => {
        res.status(HTTP_CREATED).json(formatResponse(1, 'ok', chat));
    }).catch((error) => {
        logger.log('error', error);
        res.status(HTTP_BAD_REQUEST).json(formatResponse(ExceptionCode, error.message));
    });
}
