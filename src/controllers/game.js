'use strict';

import {formatResponse} from '../utils/formatter';
import {Game, Player} from '../models';
import {GameStatus} from '../configs/status';
import {
    HTTP_OK,
    HTTP_BAD_REQUEST,
    HTTP_UNATHORIZED,
    HTTP_CREATED,
    HTTP_SERVER_ERROR, HTTP_NOT_FOUND
} from '../utils/http-status-code';
import {
    ExceptionCode,
    AuthorizationExceptionCode, ResourceNotFoundExceptionCode,
} from '../exceptions/code';

// const sock = new SocketFactory();
/**
 * @desc start a new game
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response>}
 */
export function startCtrl(req, res) {
    if (!req.session) {
        return res.status(HTTP_UNATHORIZED)
            .json(formatResponse(AuthorizationExceptionCode, 'Please signin first'));
    }

    const player = req.session.player;
    const {player2, word, chat} = req.body;

    if (!player2 || !word) {
        return res.status(HTTP_BAD_REQUEST)
            .json(formatResponse(ExceptionCode, 'No player or word provided'));
    }

    Game.create({
        player1: player._id,
        player2: player2,
        actual_word: word,
        chat: chat
    }).then((newGame) => {
        res.status(HTTP_CREATED).json(formatResponse(1, 'ok', newGame));
        GUESS_APP_SOCK.io.emit('new-game-started', {chat: newGame.chat, gameId: newGame._id});
    }).catch((error) => {
        res.status(HTTP_SERVER_ERROR)
            .json(formatResponse(ExceptionCode, 'An error occurred starting game'));
    });
}

/**
 * @desc start a new game
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response>}
 */
export function guessCtrl(req, res) {
    if (!req.session) {
        return res.status(HTTP_UNATHORIZED)
            .json(formatResponse(AuthorizationExceptionCode, 'Please signin first'));
    }

    const player = req.session.player;
    const {gameId, word} = req.body;

    if (!gameId || !word) {
        return res.status(HTTP_BAD_REQUEST)
            .json(formatResponse(ExceptionCode, 'No gamedId or word provided'));
    }

    Game.findOne({player2: player._id, _id: gameId}).then((game) => {
        if (!game) {
            return res.status(HTTP_NOT_FOUND)
                .json(formatResponse(ResourceNotFoundExceptionCode, 'Game not found'));
        }

        if (game.actual_word.toLowerCase() === word.toLowerCase()) {
            game.winner = game.player2;
            game.loser = game.player1;
        } else {
            game.winner = game.player1;
            game.loser = game.player2;
        }
        game.guessed_word = word;
        game.status = GameStatus.Completed;

        return Promise.all([
            game.save(),
            incrementPlayerLoss(game.loser),
            incrementPlayerWin(game.winner)
        ]);
    }).then((results) => {
        res.status(HTTP_OK).json(formatResponse(1, 'ok', results[0]));
        logger.log('Result updated on player');
    }).catch((error) => {
        logger.log('guessCtrl', error);
        res.status(HTTP_SERVER_ERROR)
            .json(formatResponse(ExceptionCode, 'An error occurred completing game'));
    });
}

/**
 * @desc gets all games of a player
 * @param {Request} req
 * @param {Response} res
 * @return {Promise<Response>}
 */
export function getGamesCtrl(req, res) {
    if (!req.session && !req.session.player) {
        return res.status(HTTP_UNATHORIZED)
            .json(formatResponse(AuthorizationExceptionCode, 'Please signin first'));
    }

    const player = req.session.player;

    Game.find({
        $or: [{player1: player._id}, {player2: player._id}],
    }).then((games) => {
        res.status(HTTP_OK).json(formatResponse(1, 'ok', games));
    }).catch((error) => {
        res.status(HTTP_SERVER_ERROR)
            .json(formatResponse(ExceptionCode, 'An error occurred fetching game'));
    });
}

/**
 * @desc increment the wins of the player
 * @param {String} playerId
 * @return {Promise<Player>}
 */
function incrementPlayerWin(playerId) {
    return Player.findOneAndUpdate({_id: playerId}, {$inc: {won: 1, points: 10}});
}

/**
 * @desc increment the loss of the player
 * @param {String} playerId
 * @return {Promise<Player>}
 */
function incrementPlayerLoss(playerId) {
    return Player.findOneAndUpdate({_id: playerId}, {$inc: {lost: 1}});
}
