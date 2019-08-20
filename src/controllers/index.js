'use strict';

import {HTTP_OK} from '../utils/http-status-code';
import appConfig from '../configs/app';
import {formatResponse} from '../utils/formatter';

/**
 * @desc index route
 * @param {Request} req
 * @param {Response} res
 * @return {void}
 */
export function indexCtrl(req, res) {
    logger.log('session', req.session.id);
    res.status(HTTP_OK).send(`<h1>${appConfig.name}</h1>`);
}

/**
 * @desc registers a user
 * @param {Request} req
 * @param {Response} res
 * @return {void}
 */
export function registerCtrl(req, res) {
    res.status(HTTP_OK).json(formatResponse(0, 'ok', {name: 'Hello'}));
}
