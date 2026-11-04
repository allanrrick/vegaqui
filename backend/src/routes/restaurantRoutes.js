import express from 'express';

import {
    createRestaurant,
    listRestaurants
} from '../controllers/restaurantController.js';

const router = express.Router();

router.get('/', listRestaurants);
router.post('/', createRestaurant);

export default router;