'use strict';

import * as express from 'express';
import {
    getMessageCtrl,
    getChatCtrl
} from '../controllers/chat';

const router = new express.Router();

router.get('/messages', getMessageCtrl);
router.get('/get', getChatCtrl);

export default router;
