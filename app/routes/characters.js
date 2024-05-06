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

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const character = await charactersService.getCharacter(id);
        res.json(character);
    } catch (err) {
        console.error(err);
        res.status(err.message === 'Character not found' ? 404 : 500).send({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, characterType, level, elements, attributes } = req.body;
        const result = await charactersService.createCharacter(name, characterType, level, elements, attributes);
        res.status(201).send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await charactersService.deleteCharacter(id);
        res.status(204).send(result);
    } catch (err) {
        console.error(err);
        res.status(err.message === 'Character not found' ? 404 : 500).send({ message: err.message });
    }
});

module.exports = router;

