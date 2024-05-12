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
 *           description: The ID of the team
 *         name:
 *           type: string
 *           description: The name of the team
 *         members:
 *           type: array
 *           description: The members of the team
 *           items:
 *             $ref: '#/components/schemas/Character'
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
 *         xp:
 *           type: integer
 *           description: The experience points of the character
 *         extra_points:
 *           type: integer
 *           description: The extra points of the character
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
 *  get:
 *    summary: Get all teams
 *    tags: [Teams]
 *    description: Get all teams
 *    parameters:
 *      - in: query
 *        name: community_id
 *        schema:
 *          type: integer
 *        description: Optional. Filter teams by community ID.
 *      - in: query
 *        name: orderByTotalXP
 *        schema:
 *          type: string
 *        description: Optional. Order teams by total XP. Use 'ASC' for ascending order and 'DESC' for descending order.
 *    responses:
 *      '200':
 *        description: A list of teams
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                type: object
 *                properties:
 *                  id:
 *                    type: integer
 *                    description: The team ID
 *                  name:
 *                    type: string
 *                    description: The team name
 *                  community_id:
 *                    type: integer
 *                    description: The community ID
 *      '404':
 *        description: Community not found
 *      '500':
 *        description: Internal Server Error
 */

router.get('/', async (req, res) => {
    try {
        const { community_id, orderByTotalXP } = req.query;
        const teams = await teamsService.getAllTeams(community_id, orderByTotalXP);
        res.json(teams);
    } catch (error) {
        console.error(error);
        res.status(error.message === 'Community not found' ? 404 : 500).json({ error: error.message });
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
 *               $ref: '#/components/schemas/Team'
 *       '404':
 *         description: Team not found
 *       '500':
 *         description: Internal Server Error
 */

router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const team = await teamsService.getTeam(id);
        res.json(team);
    } catch (err) {
        console.error(err);
        res.status(err.message === 'Team not found' ? 404 : 500).json({ error: err.message });
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
 *               community_id:
 *                 type: integer
 *                 description: The ID of the community the team belongs to
 *     responses:
 *       '200':
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The ID of the created team
 *                 community_id:
 *                   type: integer
 *                   description: The ID of the community the team belongs to
 *                 name:
 *                   type: string
 *                   description: The name of the created team
 *       '500':
 *         description: Internal Server Error
 */

router.post("/", async (req, res) => {
    try {
        const team = req.body;
        const result = await teamsService.createTeam(team);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// Faz sentido ter um endpoint para remover um personagem de um equipa?
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await teamsService.deleteTeam(id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

/**
 * @swagger
 * /teams/{teamId}/characters/{characterId}:
 *   post:
 *     summary: Add a character to a team
 *     tags: [Teams]
 *     description: Add a character with the specified ID to the team with the specified ID
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the team
 *       - in: path
 *         name: characterId
 *         required: true
 *         schema:
 *              $ref: '#/components/schemas/Team'
 *     responses:
 *       '200':
 *         description: Character added to the team successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       '400':
 *         description: Bad Request - Team already has 4 members or character is already a member of the team
 *       '500':
 *         description: Internal Server Error
 */

router.post("/:teamId/characters/:characterId", async (req, res) => {
    try {
        const teamId = req.params.teamId;
        const characterId = req.params.characterId;
        const result = await teamsService.addCharacterToTeam(teamId, characterId);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(err.message === 'Team already has 4 members' || err.message === 'This character is already a member of the team' ? 400 : 500).json({ error: err.message });
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
 *               $ref: '#/components/schemas/Team'
 *       '500':
 *         description: Internal Server Error
 */

router.put("/:id", async (req, res) => {
    try {
        const updates = req.body;
        const teamId = req.params.id;
        const result = await teamsService.updateTeam(teamId, updates);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;

