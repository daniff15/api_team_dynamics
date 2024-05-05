const express = require('express');
const charactersService = require("../services/characters");

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const filters = {};
        if (req.query.character_type) {
            filters.character_type = parseInt(req.query.character_type, 10);
        }

        const characters = await charactersService.getCharacters(filters);
        res.json(characters);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Server error occurred.' });
    }
});

module.exports = router;

