'use strict';

import * as express from 'express';
import {HTTP_OK} from '../utils/http-status-code';
import appConfig from '../configs/app';

const router = new express.Router();

router.get('/', (req, res) => {
    res.status(HTTP_OK).send(`<h1>${appConfig.name}</h1>`);
});

export default router;
