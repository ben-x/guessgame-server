'use strict';

import * as express from 'express';
import {
    registerCtrl,
    signInCtrl,
    logoutCtrl,
    getCtrl,
    getAllCtrl,
    startChatCtrl
} from '../controllers/player';

const router = new express.Router();

router.get('/get', getCtrl);
router.get('/get-all', getAllCtrl);
router.post('/signin', signInCtrl);
router.post('/logout', logoutCtrl);
router.post('/register', registerCtrl);
router.post('/start-chat', startChatCtrl);

export default router;
