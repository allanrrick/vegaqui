import express from 'express';

import {
    createRestaurant,
    listRestaurants,
    updateRestaurant
} from '../controllers/restaurantController.js';

const router = express.Router();

router.get('/', listRestaurants);
router.post('/', createRestaurant);
router.put('/:id', updateRestaurant);

export default router;