const express = require('express');
const charactersService = require("../services/characters");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Characters
 *   description: API endpoints for characters
 */

/**
 * @swagger
 * /characters:
 *   get:
 *     summary: Get characters
 *     tags: [Characters]
 *     description: Retrieve a list of characters based on specified filters
 *     parameters:
 *       - in: query
 *         name: character_type
 *         schema:
 *           type: integer
 *         description: ID of the character type to filter
 *     responses:
 *       200:
 *         description: A list of characters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Character'
 *       500:
 *         description: Internal Server Error
 */
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

/**
 * @swagger
 * /characters/{id}:
 *   get:
 *     summary: Get details of a character by ID
 *     tags: [Characters]
 *     description: Get details of a character by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the character to retrieve details
 *     responses:
 *       200:
 *         description: Details of the character
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Character'
 *       404:
 *         description: Not Found - The character with the specified ID does not exist
 *       500:
 *         description: Internal Server Error
 */
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

/**
 * @swagger
 * /characters:
 *   post:
 *     summary: Create a new character
 *     tags: [Characters]
 *     description: Create a new character with the provided data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Character'
 *     responses:
 *       201:
 *         description: Successfully created a new character
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Character'
 *       500:
 *         description: Internal Server Error
 */
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

/**
 * @swagger
 * /characters/{id}/xp:
 *   put:
 *     summary: Add XP to a character by ID
 *     tags: [Characters]
 *     description: Add XP to a character by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the character to add XP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               XP:
 *                 type: integer
 *                 description: The XP to add to the character
 *     responses:
 *       200:
 *         description: Successfully added XP to the character
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Character'
 *       404:
 *         description: Not Found - The character with the specified ID does not exist
 *       500:
 *         description: Internal Server Error
 */
router.put('/:id/xp', async (req, res) => {
    try {
        const id = req.params.id;
        const attribute = req.body;
        const result = await charactersService.addXPtoCharacter(id, attribute.XP);
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(err.message === 'Character not found' ? 404 : 500).send({ message: err.message });
    }
});

/**
 * @swagger
 * /characters/{id}/attributes:
 *   put:
 *     summary: Update attributes of a character by ID
 *     tags: [Characters]
 *     description: Update attributes of a character by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the character to update attributes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attributes:
 *                 type: object
 *                 description: The attributes to update for the character
 *     responses:
 *       200:
 *         description: Successfully updated attributes of the character
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Character'
 *       404:
 *         description: Not Found - The character with the specified ID does not exist
 *       500:
 *         description: Internal Server Error
 */

router.put('/:id/attributes', async (req, res) => {
    try {
        const id = req.params.id;
        const attributes = req.body;
        const result = await charactersService.updateCharacterAttributes(id, attributes);
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(err.message === 'Character not found' ? 404 : 500).send({ message: err.message });
    }
});

/**
 * @swagger
 * /characters/{id}:
 *   delete:
 *     summary: Delete a character by ID
 *     tags: [Characters]
 *     description: Delete a character by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the character to delete
 *     responses:
 *       204:
 *         description: Successfully deleted the character
 *       404:
 *         description: Not Found - The character with the specified ID does not exist
 *       500:
 *         description: Internal Server Error
 */
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

