const express = require('express');
const { sequelize } = require('./models/index');
const gamesRoutes = require('./routes/games');
const teamsRoutes = require('./routes/teams');
const charactersRoutes = require('./routes/characters');
const battlesRoutes = require('./routes/battles');
const appSwagger = require('./swagger');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(appSwagger);

app.get('/', (req, res) => {
    try {
        const rows = 'Hello World';
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.use('/games', gamesRoutes);
app.use('/teams', teamsRoutes);
app.use('/characters', charactersRoutes);
app.use('/battles', battlesRoutes);

sequelize.sync().then(() => {
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
});