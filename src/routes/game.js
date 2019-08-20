'use strict';

import * as express from 'express';
import {
    startCtrl,
    guessCtrl,
    getGamesCtrl
} from '../controllers/game';

const router = new express.Router();

router.post('/start', startCtrl);
router.post('/guess', guessCtrl);
router.get('/get', getGamesCtrl);

export default router;
