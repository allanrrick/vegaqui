import express from 'express';

import {
    createRestaurant,
    deleteRestaurant,
    listRestaurants,
    restaurantsOnMap,
    updateRestaurant
} from '../controllers/restaurantController.js';

const router = express.Router();

router.get('/', listRestaurants);
router.post('/', createRestaurant);
router.put('/:id', updateRestaurant);
router.delete('/:id', deleteRestaurant);

router.get('/map', restaurantsOnMap);
export default router;