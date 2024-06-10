const express = require('express');
const battlesService = require("../services/battles");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Utils
 *   description: API endpoints for utilities (Elements, Atributes, MaxLevel, etc.)
 */


router.get("/", async (req, res) => {
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

