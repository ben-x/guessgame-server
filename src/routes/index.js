'use strict';

import * as express from 'express';
import {indexCtrl} from '../controllers';

const router = new express.Router();
router.get('/', indexCtrl);

export default router;
