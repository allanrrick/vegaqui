import express from 'express';

import {
    listRestaurants
} from '../controllers/restauranteController.js';

const router = express.Router();

router.get('/', listRestaurants);

export default router;