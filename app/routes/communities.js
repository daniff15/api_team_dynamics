const express = require('express');
const communitiesService = require("../services/communities");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const rows = await communitiesService.getAllCommunities();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

router.post("/", async (req, res) => {
    try {
        const community = req.body;
        const result = await communitiesService.createCommunity(community);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

module.exports = router;

