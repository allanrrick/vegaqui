import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import restaurantRoutes from './routes/restaurantRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'API working well'
    });
});

app.use('/restaurants', restaurantRoutes);


app.use((req, res) =>{
    res.status(404).json({
        message: 'Route not found'
    })
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});