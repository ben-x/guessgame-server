'use strict';

import * as express from 'express';
import {HTTP_OK} from '../utils/http-status-code';

const router = new express.Router();

router.get('/', (req, res) => {
    res.status(HTTP_OK).json({
        message: 'Hello',
    });
});

export default router;
