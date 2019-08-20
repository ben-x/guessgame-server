'use strict';

import * as express from 'express';
import {indexCtrl} from '../controllers';
import PlayerRouter from './player';
import GameRouter from './game';
import ChatRouter from './chat';

const router = new express.Router();

router.get('/', indexCtrl);
router.use('/player', PlayerRouter);
router.use('/game', GameRouter);
router.use('/chat', ChatRouter);

export default router;
