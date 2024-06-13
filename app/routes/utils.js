const express = require('express');
const utilsService = require("../services/utils");

const router = express.Router();

// Define all the components of the API

/**
 * @swagger
 * components:
 *   schemas:
 *     Battle:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The ID of the battle
 *         team_id:
 *           type: integer
 *           description: The ID of the team participating in the battle
 *         boss_id:
 *           type: integer
 *           description: The ID of the boss in the battle
 *         winner_id:
 *           type: integer
 *           description: The ID of the winning team or boss
 *         battle_type:
 *           type: string
 *           description: The type of battle
 *         attacks:
 *           type: array
 *           description: List of attacks performed in the battle
 *           items:
 *             $ref: '#/components/schemas/Attack'
 *     Attack:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The ID of the attack
 *         battle_id:
 *           type: integer
 *           description: Indicates if the attack was critical
 *         attacker_id:
 *           type: integer
 *           description: The ID of the character who performed the attack
 *         defender_id:
 *           type: integer
 *           description: The ID of the character who received the attack
 *         damage:
 *           type: integer
 *           description: The damage inflicted by the attack
 *         attack_time:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the attack was performed
 *     Battle_Participant:
 *       type: object
 *       properties:
 *           id:
 *             type: integer
 *             description: The ID of the participant
 *           name:
 *             type: string
 *             description: The name of the participant
 *           team:
 *             type: integer
 *             description: The ID of the team the participant belongs to
 *           level:
 *             type: integer
 *             description: The level of the participant
 *           character_type:
 *             type: integer
 *             description: The type of character
 *           attributes:
 *             type: object
 *             properties:
 *               HP:
 *                 type: integer
 *                 description: Hit Points (HP) of the participant
 *               DEF:
 *                 type: integer
 *                 description: Defense attribute of the participant
 *               ATK:
 *                 type: integer
 *                 description: Attack attribute of the participant
 *               SPEED:
 *                 type: integer
 *                 description: Speed attribute of the participant
 *               hp_battle:
 *                 type: integer
 *                 description: Hit Points (HP) remaining after the battle
 *           real_speed:
 *             type: integer
 *             description: The actual speed of the participant
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
 * components:
 *   schemas:
 *     Game:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The ID of the game
 *         name:
 *           type: string
 *           description: The name of the game
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The team ID
 *         name:
 *           type: string
 *           description: The team name
 *         community_id_ext:
 *           type: string
 *           description: The external ID of the element, should be the id of the community on the platform
 *         game_id:
 *           type: integer
 *           description: The game ID
 *         owner_id:
 *           type: integer
 *           description: The ID of the owner of the team
 *         total_xp:
 *           type: integer
 *           description: The total XP of the team
 *         team_image_path:
 *           type: string
 *           description: The path to the team image
 *         cooldown_time:
 *           type: string
 *           format: date-time
 *           description: The cooldown time of the team
 *         members:
 *           type: array
 *           description: The members of the team
 *           items:
 *             $ref: '#/components/schemas/Player'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Element:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The ID of the element
 *         name:
 *           type: string
 *           description: The name of the element
 *         strengths:
 *           type: array
 *           description: The strengths of the element
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: The ID of the strength
 *               name:
 *                 type: string
 *                 description: The name of the strength
 *         weaknesses:
 *           type: array
 *           description: The weaknesses of the element
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: The ID of the weakness
 *               name:
 *                 type: string
 *                 description: The name of the weakness
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Character:
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
 * tags:
 *   name: Utils
 *   description: API endpoints for utilities (Elements, Atributes, MaxLevel, etc.)
 */

/**
 * @swagger
 * /utils/elements:
 *   get:
 *     summary: Get all the elements available in the game
 *     tags: [Utils]
 *     description: Get all the elements available in the game
 *     responses:
 *       '200':
 *         description: Elements retrieved successfully
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
 *                     type: object
 *                     properties:
 *                        id:
 *                           type: integer
 *                           description: The ID of the attribute
 *                        name:
 *                           type: string
 *                           description: The name of the attribute
 *                        strengths:
 *                           type: array
 *                           items:
 *                              type: object
 *                              properties:
 *                                 id:
 *                                    type: integer
 *                                    description: The ID of the strength
 *                                 name:
 *                                    type: string
 *                                    description: The name of the strength
 *                        weaknesses:
 *                           type: array
 *                           items:
 *                              type: object
 *                              properties:
 *                                 id:
 *                                    type: integer
 *                                    description: The ID of the weakness
 *                                 name:
 *                                    type: string
 *                                    description: The name of the weakness
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
router.get("/elements", async (req, res) => {
    try {
        const result = await utilsService.getAllElements();

        if (result.meta.error) {
            return res.status(result.status_code).json(result);
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

/**
 * @swagger
 * /utils/attributes:
 *   get:
 *     summary: Get all the attributes available in the game
 *     tags: [Utils]
 *     description: Get all the attributes available in the game
 *     responses:
 *       '200':
 *         description: Attributes retrieved successfully
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
 *                     type: object
 *                     properties:
 *                        id:
 *                           type: integer
 *                           description: The ID of the attribute
 *                        name:
 *                           type: string
 *                           description: The name of the attribute
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
router.get("/attributes", async (req, res) => {
    try {
        const result = await utilsService.getAllAttributes();

        if (result.meta.error) {
            return res.status(result.status_code).json(result);
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

/**
 * @swagger
 * /utils/maxLevel:
 *   get:
 *     summary: Get the max level available to reach
 *     tags: [Utils]
 *     description: Get the max level available to reach
 *     responses:
 *       '200':
 *         description: Max Level retrieved successfully
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
 *                   type: integer
 *                   description: The max level available to reach
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
router.get("/maxLevel", async (req, res) => {
    try {
        const result = await utilsService.getMaxLevel();

        if (result.meta.error) {
            return res.status(result.status_code).json(result);
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


/**
 * @swagger
 * /utils/maxLevel:
 *   post:
 *     summary: Update the max level available to reach
 *     tags: [Utils]
 *     description: Update the max level available to reach
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               level:
 *                 type: integer
 *                 description: The new max level available to reach
 *     responses:
 *       '200':
 *         description: Max Level updated to {newMaxLevel}
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
 *                   type: string
 *                   description: The new max level available to reach
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: false
 *       '400':
 *         description: Bad Request - (Level must be greater than 0/Level must be greater than the current max level. Current max level is {maxLevel})
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
router.post("/maxLevel", async (req, res) => {
    try {
        const newLevel = req.body.level;
        const result = await utilsService.updateMaxLevel(newLevel);

        if (result.meta.error) {
            return res.status(result.status_code).json(result);
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


// /**
//  * @swagger
//  * /utils/elements/{elementId}/relationships:
//  *   put:
//  *     summary: Update the relationships of an element
//  *     tags: [Utils]
//  *     description: Update the relationships of an element. `For now, an element can only have one strength and one weakness.`
//  *     parameters:
//  *       - in: path
//  *         name: elementId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *           description: The ID of the element to update
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               strengths:
//  *                 type: array
//  *                 items:
//  *                   type: integer
//  *                   description: The IDs of the elements that the element is strong against
//  *               weaknesses:
//  *                 type: array
//  *                 items:
//  *                   type: integer
//  *                   description: The IDs of the elements that the element is weak against
//  *     responses:
//  *       '200':
//  *         description: Relationships updated successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   description: A message indicating the result of the operation
//  *                 status_code:
//  *                   type: integer
//  *                   description: The status code of the response
//  *                   example: 200
//  *                 data:
//  *                   type: array
//  *                   items:
//  *                     type: object
//  *                     properties:
//  *                        id:
//  *                           type: integer
//  *                           description: The ID of the attribute
//  *                        name:
//  *                           type: string
//  *                           description: The name of the attribute
//  *                        strengths:
//  *                           type: array
//  *                           items:
//  *                              type: object
//  *                              properties:
//  *                                 id:
//  *                                    type: integer
//  *                                    description: The ID of the strength
//  *                                 name:
//  *                                    type: string
//  *                                    description: The name of the strength
//  *                        weaknesses:
//  *                           type: array
//  *                           items:
//  *                              type: object
//  *                              properties:
//  *                                 id:
//  *                                    type: integer
//  *                                    description: The ID of the weakness
//  *                                 name:
//  *                                    type: string
//  *                                    description: The name of the weakness
//  *                 meta:
//  *                   type: object
//  *                   properties:
//  *                     error:
//  *                       type: boolean
//  *                       description: Indicates if an error occurred
//  *                       example: false
//  *       '400':
//  *         description: Bad Request - An element can have only one (strength/weakness)
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   description: A message indicating the error
//  *                 status_code:
//  *                   type: integer
//  *                   description: The status code of the response
//  *                   example: 400
//  *                 meta:
//  *                   type: object
//  *                   properties:
//  *                     error:
//  *                       type: boolean
//  *                       description: Indicates if an error occurred
//  *                       example: true
//  *       404:
//  *         description: Not Found - (ElementID/Strength/Weakness) not found
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   description: A message indicating the error
//  *                 status_code:
//  *                   type: integer
//  *                   description: The status code of the response
//  *                   example: 404
//  *                 meta:
//  *                   type: object
//  *                   properties:
//  *                     error:
//  *                       type: boolean
//  *                       description: Indicates if an error occurred
//  *                       example: true
//  *       500:
//  *         description: Internal Server Error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   description: A message indicating the error
//  *                 status_code:
//  *                   type: integer
//  *                   description: The status code of the response
//  *                   example: 500
//  *                 meta:
//  *                   type: object
//  *                   properties:
//  *                     error:
//  *                       type: boolean
//  *                       description: Indicates if an error occurred
//  *                       example: true
//  */
// router.put("/elements/:elementId/relationships", async (req, res) => {
//     try {
//         const elementId = req.params.elementId;
//         const strengths = req.body.strengths;
//         const weaknesses = req.body.weaknesses;

//         const result = await utilsService.updateElementRelationships(elementId, strengths, weaknesses);

//         if (result.meta.error) {
//             return res.status(result.status_code).json(result);
//         }
//         res.json(result);
//     } catch (err) {
//         console.error(err);
//         res.sendStatus(500);
//     }
// });

module.exports = router;

