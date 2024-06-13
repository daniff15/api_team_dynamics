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
 * /battles:
 *   get:
 *     summary: Get battles
 *     tags: [Battles]
 *     description: |
 *       Retrieve a list of battles based on specified filters:
 *       - `team_id` filter: Retrieves battles where the team participated
 *       - `boss_id` filter: Retrieves battles where the boss was involved
 *       - `winner_id` filter: Retrieves battles where the specified team or boss won
 *       - `battle_type` filter: Retrieves battles of the specified type
 *       
 *       If no filters are provided, all battles are retrieved. 
 *       The filters can be combined to retrieve battles based on multiple criteria.
 *  
 *     parameters:
 *       - in: query
 *         name: team_id
 *         schema:
 *           type: integer
 *         description: ID of the team involved in the battle
 *       - in: query
 *         name: boss_id
 *         schema:
 *           type: integer
 *         description: ID of the boss involved in the battle
 *       - in: query
 *         name: winner_id
 *         schema:
 *           type: integer
 *         description: ID of the winning team or boss involved in the battle
 *       - in: query
 *         name: battle_type
 *         schema:
 *           type: string
 *           enum: [BOSS, TEAM]
 *         description: The type of battles to retrieve
 *     responses:
 *       200:
 *         description: A list of battles based on the selected filters
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
 *                       id:
 *                         type: integer
 *                         description: The ID of the battle
 *                       team_id:
 *                         type: integer
 *                         description: The ID of the team participating in the battle
 *                       opponent_team_id:
 *                         type: integer    
 *                         description: The ID of the opposing team (required for team battle)
 *                       boss_id:
 *                         type: integer
 *                         description: The ID of the boss in the battle
 *                       winner_id:
 *                         type: integer
 *                         description: The ID of the winning team or boss
 *                       battle_type:
 *                         type: string
 *                         description: The type of battle
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
        if (battles.meta.error) {
            return res.status(battles.status_code).json(battles);
        }
        res.json(battles);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


/**
 * @swagger
* /battles/{id}:
 *   get:
 *     summary: Get details of a battle by ID
 *     tags: [Battles]
 *     description: Get details of a battle including attacks performed during the battle.
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
 *                 status_code:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 200
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

router.get("/:id", async (req, res) => {
    try {
        const battleDetails = await battlesService.getBattle(req.params.id);
        if (battleDetails.meta.error) {
            return res.status(battleDetails.status_code).json(battleDetails);
        }
        res.json(battleDetails);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

/**
 * @swagger
 * /battles:
 *   post:
 *     summary: Create a new battle
 *     tags: [Battles]
 *     description: |
 *       Create a new battle with the provided data. 
 *       If the battle is a team battle, the `team_id` and `opponent_team_id` fields are required. 
 *       If the battle is a boss battle, the `team_id` and `boss_id` fields are required. 
 *       
 *       Boss battles give rewards based on boss level (only the first time the boss is defeated) 
 *       and cooldown time is activated if the team is defeated by the boss. 
 *       Team battles give no rewards and have no cooldown time.
 *  
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
 *                 status_code:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 201
 *                 data:
 *                   type: object
 *                   properties:
 *                     battle:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: The ID of the battle
 *                         team_id:
 *                           type: integer
 *                           description: The ID of the team participating in the battle
 *                         opponent_team_id:
 *                           type: integer    
 *                           description: The ID of the opposing team (required for team battle)
 *                         boss_id:
 *                           type: integer
 *                           description: The ID of the boss in the battle
 *                         winner_id:
 *                           type: integer
 *                           description: The ID of the winning team or boss
 *                         battle_type:
 *                           type: string
 *                           description: The type of battle
 *                     participants:
 *                       type: array 
 *                       items:
 *                           $ref: '#/components/schemas/Battle_Participant'
 *                     reward:
 *                       type: integer
 *                       description: The reward for winning the battle
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: false
 *       400:
 *         description: Bad Request - (You can only have one opponent/You must have an opponent/Team must have 4 characters/Opponent team must have 4 characters/Boss not in the game narrative/Team is on cooldown and cannot battle any bosses. Cooldown till - {cooldown_time})
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
 *         description: Not Found - The (team/oponnent_team/boss) with the specified ID does not exist
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
router.post("/", async (req, res) => {
    try {
        const battle = await battlesService.createBattle(req.body);
        if (battle.meta.error) {
            return res.status(battle.status_code).json(battle);
        }
        res.status(201).json(battle);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

module.exports = router;

