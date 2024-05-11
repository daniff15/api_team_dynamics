const express = require('express');
const teamsService = require("../services/teams");
const { ElementsModel, ElementRelationshipsModel } = require('../models');

const router = express.Router();

// Router
router.get('/teste/:id', async (req, res) => {
    try {
        const elementId = req.params.id;

        const element = await ElementsModel.findOne({
            where: { id: elementId },
            include: [
                { 
                    model: ElementRelationshipsModel, 
                    as: 'strengths', 
                    include: [{ 
                        model: ElementsModel, 
                        as: 'element'
                    }] 
                },
                { 
                    model: ElementRelationshipsModel, 
                    as: 'weaknesses', 
                    include: [{ 
                        model: ElementsModel, 
                        as: 'element'
                    }] 
                }
            ]
        });

        if (!element) {
            return res.status(404).json({ error: 'Element not found' });
        }

        console.log(element.strengths[0].element);
        const strengths = {
            id: element.strengths[0].element.id,
            name: element.strengths[0].element.name
        };
        const weaknesses = {
            id: element.weaknesses[0].element.id,
            name: element.weaknesses[0].element.name
        };

        const responseData = {
            id: element.id,
            name: element.name,
            strengths: strengths,
            weaknesses: weaknesses
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching element:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get("/", async (req, res) => {
    try {
        const communityId = req.query.community_id;
        const rows = await teamsService.getAllTeams(communityId);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

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

