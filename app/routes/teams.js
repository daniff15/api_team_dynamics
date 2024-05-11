const express = require('express');
const teamsService = require("../services/teams");

const router = express.Router();

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

router.put("/", async (req, res) => {
    try {
        const updates = req.body;
        const teamId = req.body.id;
        const result = await teamsService.updateTeam(teamId, updates);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;

