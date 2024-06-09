const express = require('express');
const teamsService = require("../services/teams");

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: API endpoints for Teams
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
 * /teams:
 *   get:
 *     summary: Get all teams
 *     tags: [Teams]
 *     description: Get all teams. The `order_by_total_xp` parameter can be used to order teams by total XP in ascending or descending order.
 *     parameters:
 *       - in: query
 *         name: game_id
 *         schema:
 *           type: integer
 *         description: Optional. Filter teams by game narrative ID.
 *       - in: query
 *         name: order_by_total_xp
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *       - in: query
 *         name: search_comm_term
 *         schema:
 *           type: string
 *         description: Optional. Order teams by total XP. Use 'ASC' for ascending order and 'DESC' for descending order.
 *     responses:
 *       200:
 *         description: A list of teams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                     description: A message indicating the result of the operation
 *                   statusCode:
 *                     type: integer
 *                     description: The status code of the response
 *                     example: 200
 *                   data:
 *                     type: array
 *                     items:
 *                      type: object
 *                      properties:
 *                        id:
 *                          type: integer
 *                          description: The team ID
 *                        name:
 *                          type: string
 *                          description: The team name
 *                        community_id_ext:
 *                          type: string
 *                          description: The external ID of the element, should be the id of the community on the platform
 *                        game_id:
 *                          type: integer
 *                          description: The game ID
 *                        owner_id:
 *                          type: integer
 *                          description: The ID of the owner of the team
 *                        total_xp:
 *                          type: integer
 *                          description: The total XP of the team
 *                        team_image_path:
 *                          type: string
 *                          description: The path to the team image
 *                        cooldown_time:
 *                          type: string
 *                          format: date-time
 *                          description: The cooldown time of the team
 *                   meta:
 *                     type: object
 *                     properties:
 *                       error:
 *                         type: boolean
 *                         description: Indicates if an error occurred
 *                         example: false
 *       404:
 *         description: Not Found - Game not found
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
router.get('/', async (req, res) => {
    try {
        const { game_id, order_by_total_xp, search_comm_term } = req.query;
        const teams = await teamsService.getAllTeams(game_id, order_by_total_xp, search_comm_term);
        if (teams.meta.error) {
            return res.status(teams.statusCode).json(teams);
        }
        res.json(teams);
    } catch (error) {
        console.error(err);
        res.sendStatus(500);
    }
});

/**
 * @swagger
 * /teams/{id}:
 *   get:
 *     summary: Get a team by ID
 *     tags: [Teams]
 *     description: Get detailed information about a team by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the team to retrieve
 *     responses:
 *       '200':
 *         description: A team object
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
 *                   $ref: '#/components/schemas/Team'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: false
 *       '404':
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

router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const team = await teamsService.getTeam(id);
        if (team.meta.error) {
            return res.status(team.statusCode).json(team);
        }
        res.json(team);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});


/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     description: Create a new team with the provided data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the team
 *               game_id:
 *                 type: integer
 *                 description: The ID of the game the team belongs to
 *               owner_id:
 *                 type: integer
 *                 description: The ID of the owner of the team
 *               community_id_ext:
 *                 type: string
 *                 description: The external ID of the element, should be the id of the community on the platform
 *     responses:
 *       '201':
 *         description: Team created successfully
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
 *                   example: 201
 *                 data:
 *                   type: object    
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The team ID
 *                     name:
 *                       type: string
 *                       description: The team name
 *                     community_id_ext:
 *                       type: string
 *                       description: The external ID of the element, should be the id of the community on the platform
 *                     game_id:
 *                       type: integer
 *                       description: The game ID
 *                     owner_id:
 *                       type: integer
 *                       description: The ID of the owner of the team
 *                     total_xp:
 *                       type: integer
 *                       description: The total XP of the team
 *                     team_image_path:
 *                       type: string
 *                       description: The path to the team image
 *                     cooldown_time:
 *                       type: string
 *                       format: date-time
 *                       description: The cooldown time of the team
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: false
 *       '404':
 *         description: Not Found - Game not found
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
 *       '409':
 *         description: Conflict - (Player is already a member of a team. Create a new player to create a new team./A Team with the same name already exists in this game!)
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
 *       '500':
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
        const team = req.body;
        const result = await teamsService.createTeam(team);
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
 * /teams/{id}:
 *   delete:
 *     summary: Delete a team
 *     tags: [Teams]
 *     description: Remove the team with the specified ID. If the team is deleted, all members will be deleted as well.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the team to delete
 *     responses:
 *       '200':
 *         description: Team deleted successfully
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the deleted team
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: false
 *       '400':
 *         description: Bad Request - Invalid team ID
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
 *       '404':
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
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await teamsService.deleteTeam(id);
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
 * /teams/{team_id}/players:
 *   post:
 *     summary: Add a character to a team
 *     tags: [Teams]
 *     description: Add a character with the specified ID to the team with the specified ID
 *     parameters:
 *       - in: path
 *         name: team_id
 *         required: true
 *         type: integer
 *         description: The ID of the team
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               character_id:
 *                 type: integer
 *                 description: The ID of the character to add to the team
 *     responses:
 *       '200':
 *         description: Character added to the team successfully
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
 *                   type: object    
 *                   properties:
 *                     game_id:
 *                       type: integer
 *                       description: The ID of the game the team belongs to
 *                     player_id:
 *                       type: integer
 *                       description: The ID of the player that was added to the team
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: false
 *       '400':
 *         description: Bad Request - (Team already has 4 members/Impossible to add that player to a team, player is not at default stats or level.)
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
 *       '404':
 *         description: Not Found - (Team/Character) not found
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
 *       '409':
 *         description: Conflict - (Character is already a member of a team in the same game/Character is already on the team)
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

router.post("/:team_id/players", async (req, res) => {
    try {
        const teamId = req.params.team_id;
        const characterId = req.body.character_id;
        const result = await teamsService.addCharacterToTeam(teamId, characterId);
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
 * /teams/{id}:
 *   put:
 *     summary: Update a team's name
 *     tags: [Teams]
 *     description: Update the name of the team with the specified ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the team to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name for the team
 *     responses:
 *       '200':
 *         description: Team name updated successfully
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
 *                   type: object    
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The team ID
 *                     name:
 *                       type: string
 *                       description: The team name
 *                     community_id_ext:
 *                       type: string
 *                       description: The external ID of the element, should be the id of the community on the platform
 *                     game_id:
 *                       type: integer
 *                       description: The game ID
 *                     owner_id:
 *                       type: integer
 *                       description: The ID of the owner of the team
 *                     total_xp:
 *                       type: integer
 *                       description: The total XP of the team
 *                     team_image_path:
 *                       type: string
 *                       description: The path to the team image
 *                     cooldown_time:
 *                       type: string
 *                       format: date-time
 *                       description: The cooldown time of the team
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: false
 *       '400':
 *         description: Bad Request - No valid fields to update
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
 *       '404':
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
 *       '409':
 *         description: Conflict - Team with the same name already exists in the game narrative.
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

router.put("/:id", async (req, res) => {
    try {
        const updates = req.body;
        const teamId = req.params.id;
        const result = await teamsService.updateTeam(teamId, updates);
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
 * /teams/leave/{id}:
 *   delete:
 *     summary: Leave a team.
 *     tags: [Teams]
 *     description: Leave the team with the specified ID.  If the player that left the team was the owner, the team ownership will be transferred to another member. If no other members are present, the team will be deleted.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the player that will leave the team
 *     responses:
 *       '200':
 *         description: Player left the team successfully
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
 *                   type: object
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: false
 *       '400':
 *         description: Bad Request - Player is not part of the team
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
 *       '404':
 *         description: Not Found - Player not found
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

router.delete("/leave/:id", async (req, res) => {
    try {
        const playerId = req.params.id;
        const result = await teamsService.leaveTeam(playerId);
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
 * /teams/owner/{id}:
 *   put:
 *     summary: Change the owner of a team
 *     tags: [Teams]
 *     description: Change the owner of the team with the specified ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the player that will become the owner of the team
 *     responses:
 *       '200':
 *         description: Player became the owner of the team successfully
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
 *                   type: object    
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The team ID
 *                     name:
 *                       type: string
 *                       description: The team name
 *                     community_id_ext:
 *                       type: string
 *                       description: The external ID of the element, should be the id of the community on the platform
 *                     game_id:
 *                       type: integer
 *                       description: The game ID
 *                     owner_id:
 *                       type: integer
 *                       description: The ID of the owner of the team
 *                     total_xp:
 *                       type: integer
 *                       description: The total XP of the team
 *                     team_image_path:
 *                       type: string
 *                       description: The path to the team image
 *                     cooldown_time:
 *                       type: string
 *                       format: date-time
 *                       description: The cooldown time of the team
 *                 meta:
 *                   type: object
 *                   properties:
 *                     error:
 *                       type: boolean
 *                       description: Indicates if an error occurred
 *                       example: false
 *       '400':
 *         description: Bad Request - (Player is not a member of any team/Player is already the owner of the team)
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
 *       '404':
 *         description: Not Found - Player not found
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
router.put("/owner/:id", async (req, res) => {
    try {
        const playerId = req.params.id;
        const result = await teamsService.changeOwner(playerId);
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

