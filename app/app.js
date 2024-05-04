const express = require('express');
const pool = require('./config/connection');
const communitiesRoutes = require('./routes/communities');

const app = express();
const PORT = process.env.PORT || 5001;
app.use(express.json());

app.get('/', (req, res) => {
    try {
        // send hello world
        const rows = 'Hello World';
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.use('/communities', communitiesRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
