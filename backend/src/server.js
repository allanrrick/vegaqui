import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'API working well'
    });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running in port ${PORT}`);
});
