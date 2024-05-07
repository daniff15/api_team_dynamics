const express = require('express');
const battlesService = require("../services/battles");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const filters = {
            team_id: req.query.team_id,
            boss_id: req.query.boss_id,
            winner_id: req.query.winner_id,
            battle_type: req.query.battle_type
        };

        Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

        const [battles] = await battlesService.getAllBattles(filters);
        res.json(battles);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const battleDetails = await battlesService.getBattle(req.params.id);
        res.json(battleDetails);
    } catch (err) {
        console.error(err);
        res.status(404).json({ error: err.message });
    }
});

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

