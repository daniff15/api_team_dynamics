const express = require('express');
const charactersService = require("../services/characters");

const router = express.Router();

/**
 * @swagger
 * tags:
 *  name: Characters
 *  description: API endpoints for characters
 */

/**
 * @swagger
 * /characters:
 *   get:
 *     summary: Get characters
 *     tags: [Characters]
 *     description: Retrieve a list of characters based on specified filters (Player - 1, Minion - 2, Boss - 3). The `order_by_xp` filter can only be used when `character_type` is 1 (Player).
 *     parameters:
 *       - in: query
 *         name: character_type
 *         schema:
 *           type: integer
 *         description: ID of the character type to filter
 *       - in: query
 *         name: order_by_xp
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Order players by XP (can only be used when character_type is 1)
 *     responses:
 *       200:
 *         description: A list of characters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the result of the operation
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Character'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: false
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error
 *                 statusCode:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 500
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: true
 */
router.get('/', async (req, res) => {
    try {
        const filters = {};
        if (req.query.character_type) {
            filters.character_type = parseInt(req.query.character_type, 10);
        }

        const characters = await charactersService.getCharacters(filters);
        if (characters.meta.error) {
            return res.status(characters.statusCode).json(characters);
        }
        res.json(characters);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
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
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the result of the operation
 *                 data:
 *                   $ref: '#/components/schemas/Character'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: false
 *       404:
 *         description: Not Found - The character with the specified ID does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error
 *                 statusCode:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 404
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: true
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error
 *                 statusCode:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 500
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: true
 */
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const character = await charactersService.getCharacter(id);
        if (character.meta.error) {
            return res.status(character.statusCode).json(character);
        }
        res.json(character);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

/**
 * @swagger
 * /characters:
 *   post:
 *     summary: Create a new character
 *     tags: [Characters]
 *     description: Create a new character with the provided data. Player Required Fields - name, characterType, element (only one). Minion/Boss Required Fields - name, characterType, elements (can be more than one), attributes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the character
 *               characterType:
 *                 type: integer
 *                 description: The type of character (1 for player character, 3 for boss character)
 *               level:
 *                 type: integer
 *                 description: The level of the character (optional, required only for boss/minions characters)
 *               elements:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: An array of element IDs associated with the character
 *               attributes:
 *                 type: object
 *                 description: The attributes of the character (optional, required only for boss characters)
 *                 properties:
 *                   HP:
 *                     type: integer
 *                     description: The health points of the boss character
 *                   DEF:
 *                     type: integer
 *                     description: The defense points of the boss character
 *                   ATK:
 *                     type: integer
 *                     description: The attack points of the boss character
 *                   SPEED:
 *                     type: integer
 *                     description: The speed attribute of the boss character
 *                   XP:
 *                     type: integer
 *                     description: The experience points of the boss character
 *     responses:
 *       201:
 *         description: Successfully created a new character
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the result of the operation
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the newly created character
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: false
 *       400:
 *         description: Bad Request - The request body is invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error
 *                 statusCode:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 400
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: true
 *       404:
 *         description: Not Found - Element not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error
 *                 statusCode:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 404
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: true
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error
 *                 statusCode:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 500
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: true
 */
router.post('/', async (req, res) => {
    try {
        const { name, ext_id, characterType, level, elements, attributes, image_path, before_defeat_phrase, after_defeat_phrase } = req.body;
        const result = await charactersService.createCharacter(name, ext_id, characterType, level, elements, attributes, image_path, before_defeat_phrase, after_defeat_phrase);
        if (result.meta.error) {
            return res.status(result.statusCode).json(result);
        }
        res.status(201).send(result);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
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
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the result of the operation
 *                 data:
 *                   $ref: '#/components/schemas/Character'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: false
 *       400:
 *         description: Bad Request - The request body is invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error
 *                 statusCode:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 400
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: true
 *       404:
 *         description: Not Found - The character with the specified ID does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error
 *                 statusCode:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 404
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: true
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error
 *                 statusCode:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 500
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: true
 */
router.put('/:id/xp', async (req, res) => {
    try {
        const id = req.params.id;
        const attribute = req.body;
        const result = await charactersService.addXPtoCharacter(id, attribute.XP);
        if (result.meta.error) {
            return res.status(result.statusCode).json(result);
        }
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


/**
 * @swagger
 * /characters/{id}/attributes:
 *   put:
 *     summary: Update attributes of a character by ID
 *     tags: [Characters]
 *     description: Update attributes of a character by its ID. If you don't want the field to be updated just don't include it in the request body or set it to zero.
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
 *                 properties:
 *                   HP:
 *                     type: integer
 *                     description: The health points of the character
 *                   ATK:
 *                     type: integer
 *                     description: The attack points of the character
 *                   SPEED:
 *                     type: integer
 *                     description: The speed attribute of the character
 *                   DEF:
 *                     type: integer
 *                     description: The defense points of the character
 *             example:
 *                 HP: 10
 *                 ATK: 1
 *                 SPEED: 4
 *                 DEF: 1
 *     responses:
 *       200:
 *         description: Successfully updated attributes of the character
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the result of the operation
 *                 statusCode:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/Character'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: false
 *       400:
 *         description: Bad Request - The request body is invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error
 *                 statusCode:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 400
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: true
 *       404:
 *         description: Not Found - The character with the specified ID does not exist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error
 *                 statusCode:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 404
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: true
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error
 *                 statusCode:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 500
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: true
 */
router.put('/:id/attributes', async (req, res) => {
    try {
        const id = req.params.id;
        const attributes = req.body;
        const result = await charactersService.updateCharacterAttributes(id, attributes);
        if (result.meta.error) {
            return res.status(result.statusCode).json(result);
        }
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

module.exports = router;

