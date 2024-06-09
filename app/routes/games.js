const express = require('express');
const gamesService = require("../services/games");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Games
 *   description: API endpoints for games
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
 * /games:
 *   get:
 *     summary: Get all games
 *     tags: [Games]
 *     description: Get all games
 *     responses:
 *       200:
 *         description: A list of games
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the result of the operation
 *                 data:
 *                   $ref: '#/components/schemas/Game'
 *                 statusCode:
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
        const rows = await gamesService.getAllGames();
        if (rows.meta.error) {
            return res.status(rows.statusCode).json(rows);
        }
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});
/**
 * @swagger
 * /games/{id}:
 *   get:
 *     summary: Get a game narrative by ID
 *     tags: [Games]
 *     description: Get a game narrative by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the game to retrieve
 *     responses:
 *       200:
 *         description: A single game object
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
 *                     game:
 *                       $ref: '#/components/schemas/Game'
 *                     bosses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Boss'
 *                 statusCode:
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
 *         description: Not Found - Game Narrative not found
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
        const id = req.params.id;
        const game = await gamesService.getGame(id);
        if (game.meta.error) {
            return res.status(game.statusCode).json(game);
        }
        res.json(game);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

/**
 * @swagger
 * /games:
 *   post:
 *     summary: Create a new game narrative
 *     tags: [Games]
 *     description: Create a new game narrative with the provided name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the game narrative
 *     responses:
 *       201:
 *         description: The created game narrative object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the result of the operation
 *                 data:
 *                   $ref: '#/components/schemas/Game'
 *                 statusCode:
 *                   type: integer
 *                   description: The status code of the response
 *                   example: 201
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
router.post("/", async (req, res) => {
    try {
        const game = req.body;
        const result = await gamesService.createGame(game);
        if (result.meta.error) {
            return res.status(result.statusCode).json(result);
        }
        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

/**
 * @swagger
 * /games/{id}/bosses:
 *   put:
 *     summary: Update the game with the bosses
 *     tags: [Games]
 *     description: Update the game with the bosses
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the game
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bosses:
 *                 type: array
 *                 description: An array of boss IDs
 *                 items:
 *                   type: integer
 *                   description: The ID of a boss
 *     responses:
 *       200:
 *         description: The game was successfully updated with the bosses
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
 *                     type: object
 *                     properties:
 *                       game_id:
 *                         type: integer
 *                         description: The ID of the game
 *                       boss_id:
 *                         type: integer
 *                         description: The ID of the boss
 *                 statusCode:
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
 *       400:
 *         description: Bad Request - (The request body is invalid/No bosses provided)
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
 *         description: Not Found - (Game/Boss) not found
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
 *       409:
 *         description: Conflict - The following bosses are already associated with the game - {existingBossConflicts}
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
 *                   example: 409
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
router.put("/:id/bosses", async (req, res) => {
    try {
        const id = req.params.id;
        const { bosses } = req.body;
        const result = await gamesService.postBossesToGame(id, bosses);
        if (result.meta.error) {
            return res.status(result.statusCode).json(result);
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

/**
 * @swagger
 * /games/odds/{team_id}:
 *   get:
 *     summary: Get the odds of a game by ID
 *     tags: [Games]
 *     description: Get the odds of a game by its ID
 *     parameters:
 *       - in: path
 *         name: team_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the team to retrieve the odds for
 *     responses:
 *       200:
 *         description: The game odds were successfully retrieved
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
 *                     type: object
 *                     properties:
 *                       boss_id:
 *                         type: integer
 *                         description: The ID of the boss
 *                       win_rate:
 *                         type: number
 *                         description: The win rate the team has against the boss
 *                 statusCode:
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
 *         description: Not Found - Team not found
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
router.get("/odds/:team_id", async (req, res) => {
    try {
        const teamId = parseInt(req.params.team_id);

        const result = await gamesService.getGameOdds(teamId);
        if (result.meta.error) {
            return res.status(result.statusCode).json(result);
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            message: err.message, 
            statusCode: 500, 
            meta: { error: true } 
        });
    }
});

/**
 * @swagger
 * /games/status/{team_id}:
 *   get:
 *     summary: Check the narrative status of a game for a team
 *     tags: [Games]
 *     description: Check if a team has defeated all the bosses in the narrative
 *     parameters:
 *       - in: path
 *         name: team_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the team to check the narrative status for
 *     responses:
 *       200:
 *         description: Narrative status of the game for the team
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
 *                     narrative_completed:
 *                         type: boolean
 *                         description: Indicates if the team has defeated all bosses in the narrative
 *                     defeated_boss_ids:
 *                         type: array
 *                         items:
 *                            type: integer
 *                            description: IDs of the bosses defeated by the team
 *                     remaining_boss_ids:
 *                            type: array
 *                            items:
 *                              type: integer
 *                              description: IDs of the remaining bosses to be defeated by the team
 *                 statusCode:
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
 *         description: Not Found - Team not found
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
router.get("/status/:team_id", async (req, res) => {
    try {
        const teamId = req.params.team_id;
        const result = await gamesService.checkNarrativeStatus(teamId);
        if (result.meta.error) {
            return res.status(result.statusCode).json(result);
        }
        res.json(result);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


module.exports = router;
