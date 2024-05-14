const express = require('express');
const battlesService = require("../services/battles");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Battles
 *   description: API endpoints for battles
 */

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
 */

/**
 * @swagger
 * /battles:
 *   get:
 *     summary: Get battles
 *     tags: [Battles]
 *     description: Retrieve a list of battles based on specified filters
 *     parameters:
 *       - in: query
 *         name: team_id
 *         schema:
 *           type: integer
 *         description: ID of the team participating in the battles
 *       - in: query
 *         name: boss_id
 *         schema:
 *           type: integer
 *         description: ID of the boss involved in the battles
 *       - in: query
 *         name: winner_id
 *         schema:
 *           type: integer
 *         description: ID of the winning team or boss in the battles
 *       - in: query
 *         name: battle_type
 *         schema:
 *           type: string
 *         description: Type of battles to filter [boss, team]
 *     responses:
 *       200:
 *         description: A list of battles
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
 *                     $ref: '#/components/schemas/Battle'
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
router.get("/", async (req, res) => {
    try {
        const filters = {
            team_id: req.query.team_id,
            boss_id: req.query.boss_id,
            winner_id: req.query.winner_id,
            battle_type: req.query.battle_type
        };

        Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

        const battles = await battlesService.getAllBattles(filters);
        res.json(battles);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});


/**
 * @swagger
* /battles/{id}:
 *   get:
 *     summary: Get details of a battle by ID
 *     tags: [Battles]
 *     description: Get details of a battle including attacks by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the battle to retrieve details
 *     responses:
 *       200:
 *         description: Details of the battle
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
 *                     $ref: '#/components/schemas/Battle'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: false
 *       404:
 *         description: Not Found - The battle with the specified ID does not exist
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

router.get("/:id", async (req, res) => {
    try {
        const battleDetails = await battlesService.getBattle(req.params.id);
        res.json(battleDetails);
    } catch (err) {
        console.error(err);
        res.status(404).json({ error: err.message });
    }
});

/**
 * @swagger
 * /battles:
 *   post:
 *     summary: Create a new battle
 *     tags: [Battles]
 *     description: Create a new battle with the provided data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               team_id:
 *                 type: integer
 *                 description: The ID of the team initiating the battle
 *               opponent_team_id:
 *                 type: integer
 *                 nullable: true
 *                 description: The ID of the opposing team (required for team battle)
 *               boss_id:
 *                 type: integer
 *                 nullable: true
 *                 description: The ID of the boss being battled (required for boss battle)
 *     responses:
 *       201:
 *         description: Successfully created a new battle
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
 *                     $ref: '#/components/schemas/Battle'
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
 *         description: Not Found - The battle with the specified ID does not exist
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
router.post("/", async (req, res) => {
    try {
        const battle = await battlesService.createBattle(req.body);
        res.json(battle);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

