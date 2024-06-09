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
 * components:
 *   schemas:
 *     Player:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The ID of the character
 *         ext_id:
 *           type: string
 *           description: The external ID of the character
 *         name:
 *           type: string
 *           description: The name of the character
 *         level:
 *           type: integer
 *           description: The level of the character
 *         character_type_id:
 *           type: integer
 *           description: The character type ID
 *         xp:
 *           type: integer
 *           description: The XP of the character
 *         total_xp:
 *           type: integer
 *           description: The total XP of the character
 *         att_xtra_points:
 *           type: integer
 *           description: The extra points of the character
 *         image_path:
 *           type: string
 *           description: The path to the character image
 *         attributes:
 *           type: object
 *           description: The attributes of the character
 *           properties:
 *             HP:
 *               type: integer
 *               description: The health points of the character
 *             DEF:
 *               type: integer
 *               description: The defense points of the character
 *             ATK:
 *               type: integer
 *               description: The attack points of the character
 *             SPEED:
 *               type: integer
 *               description: The speed of the character
 *         elements:
 *           type: array
 *           description: The elements of the character
 *           items:
 *             $ref: '#/components/schemas/Element'
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     Boss:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The ID of the character
 *         name:
 *           type: string
 *           description: The name of the character
 *         level:
 *           type: integer
 *           description: The level of the character
 *         character_type_id:
 *           type: integer
 *           description: The character type ID
 *         image_path:
 *           type: string
 *           description: The path to the character image
 *         before_defeat_phrase:
 *           type: string
 *           description: The phrase that is displayed before the boss is defeated
 *         after_defeat_phrase:
 *           type: string
 *           description: The phrase that is displayed after the boss is defeated
 *         cooldown_time:
 *           type: integer
 *           description: The cooldown period in seconds that the team who got defeated has to wait until they can fight another boss again (seconds)
 *         attributes:
 *           type: object
 *           description: The attributes of the character
 *           properties:
 *             HP:
 *               type: integer
 *               description: The health points of the character
 *             DEF:
 *               type: integer
 *               description: The defense points of the character
 *             ATK:
 *               type: integer
 *               description: The attack points of the character
 *             SPEED:
 *               type: integer
 *               description: The speed of the character
 *         elements:
 *           type: array
 *           description: The elements of the character
 *           items:
 *             $ref: '#/components/schemas/Element'
 */

/**
 * @swagger
 * /characters:
 *   get:
 *     summary: Get characters
 *     tags: [Characters]
 *     description: |
 *       Retrieve a list of characters based on specified filters:
 *       - Player: 1
 *       - Minion: 2
 *       - Boss: 3
 *       
 *       The `order_by_total_xp` filter can only be used when `character_type` is 1 (Player).
 *       
 *       The response structure is similar for players, minions, and bosses. However, if `character_type` is 1 (Player), additional attributes such as `ext_id`, `xp`, `total_xp`, and `att_xtra_points` will be returned. 
 *       If `character_type` is 2 or 3, the attributes `before_defeat_phrase`, `after_defeat_phrase`, and `cooldown_time` (represents the cooldown period in seconds that the team who got defeated has to wait until they can fight another boss again) will be returned.
 *     
 *     parameters:
 *       - in: query
 *         name: character_type
 *         schema:
 *           type: integer
 *         description: ID of the character type to filter
 *       - in: query
 *         name: order_by_total_xp
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
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
 *                 status_code:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 200
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
 *                 status_code:
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
            filters.order_by_total_xp = req.query.order_by_total_xp;
        }

        const characters = await charactersService.getCharacters(filters);
        if (characters.meta.error) {
            return res.status(characters.status_code).json(characters);
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
 *         description: Details of the character (This example response only contains the attributes that are common to all character types. The response will contain more attributes depending on the character type.)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the result of the operation
 *                 status_code:
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
 *                 status_code:
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
 *                 status_code:
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
            return res.status(character.status_code).json(character);
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
 *     description: |
 *       Create a new character with the provided data. 
 *       Player Required Fields:
 *       - `name`
 *       - `ext_id` (corresponds to the ID of the player in the platform)
 *       - `characterType`
 *       - `element` (only one).
 *       
 *       Minion/Boss Required Fields:
 *       - `name`
 *       - `characterType`
 *       - `elements` (can be more than one)
 *       - `attributes`
 *       - `cooldown_time`.
 *       
 *       Optional Fields:
 *       - `image_path` (for all character types)
 *       
 *       Required Fields for Boss/Minions:
 *       - `level` (required only for boss/minions characters)
 *       
 *       Required Fields for Boss characters:
 *       - `attributes` (required only for boss characters)
 *       - `before_defeat_phrase` and `after_defeat_phrase` (optional for boss characters).
 *
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
 *               ext_id:
 *                 type: string
 *                 description: The external ID of the character
 *               image_path:
 *                 type: string
 *                 description: The path to the image of the character
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
 *                 status_code:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 201
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
 *                 status_code:
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
 *         description: Not Found - (Element/Attribute {name}) not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error
 *                 status_code:
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
 *                 status_code:
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
            return res.status(result.status_code).json(result);
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
 *                 status_code:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/Player'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: false
 *       400:
 *         description: Bad Request - (The request body is invalid/Character is not a player character/Character is not a member of any team)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error
 *                 status_code:
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
 *                 status_code:
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
 *                 status_code:
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
            return res.status(result.status_code).json(result);
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
 *                 status_code:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/Player'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: false
 *       400:
 *         description: Bad Request - (The request body is invalid/Attributes can only be updated for player characters/Character is not a member of any team/Insufficient extra points to update attributes)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error
 *                 status_code:
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
 *         description: Not Found - (The character with the specified ID does not exist/Attribute {key} not found or not updatable)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the error
 *                 status_code:
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
 *                 status_code:
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
            return res.status(result.status_code).json(result);
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
 * /characters/extraPoints:
 *   put:
 *     summary: Give extra points to a teammate
 *     tags: [Characters]
 *     description: Give extra points to a teammate. The player that is giving the points must have enough points to give. The player that is receiving the points must be a player character and belong to the same team as the player that is giving the points.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               from_player_id:
 *                 type: integer
 *                 description: The ID of the player that is giving the points
 *               to_player_id:
 *                 type: integer
 *                 description: The ID of the player that is receiving the points
 *               points:
 *                 type: integer
 *                 description: The amount of points to give to the teammate
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
 *                 status_code:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                      from_player:
 *                         $ref: '#/components/schemas/Player'
 *                      to_player:
 *                         $ref: '#/components/schemas/Player'
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
 *                 status_code:
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
 *                 status_code:
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
 *                 status_code:
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
router.put('/extraPoints', async (req, res) => {
    try {
        const { from_player_id, to_player_id, points } = req.body;
        const result = await charactersService.transferExtraPoints(from_player_id, to_player_id, points);
        if (result.meta.error) {
            return res.status(result.status_code).json(result);
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
 * /characters/{id}:
 *   delete:
 *     summary: Delete a character by ID
 *     tags: [Characters]
 *     description: Delete a character by its ID. If the character is a player character and is owner of a team, the team ownership will be transferred to another player character in the same team, if no other player character is in the team, the team will be deleted.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the character to delete
 *     responses:
 *       200:
 *         description: Successfully deleted the character
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the result of the operation
 *                 status_code:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 200
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
 *                 status_code:
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
 *                 status_code:
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
router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await charactersService.deleteCharacter(id);
        if (result.meta.error) {
            return res.status(result.status_code).json(result);
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

module.exports = router;

