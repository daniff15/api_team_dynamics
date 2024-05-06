const express = require('express');
const battlesService = require("../services/battles");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const rows = await battlesService.getAllBattles();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

module.exports = router;

