const express = require('express');
const communitiesService = require("../services/communities");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Communities
 *   description: API endpoints for communities
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Community:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The ID of the community
 *         name:
 *           type: string
 *           description: The name of the community
 */

/**
 * @swagger
 * /communities:
 *   get:
 *     summary: Get all communities
 *     tags: [Communities]
 *     description: Get all communities
 *     responses:
 *       200:
 *         description: A list of communities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the result of the operation
 *                 data:
 *                   $ref: '#/components/schemas/Community'
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
        const rows = await communitiesService.getAllCommunities();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

/**
 * @swagger
 * /communities/{id}:
 *   get:
 *     summary: Get a community by ID
 *     tags: [Communities]
 *     description: Get a community by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the community to retrieve
 *     responses:
 *       200:
 *         description: A single community object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the result of the operation
 *                 data:
 *                   $ref: '#/components/schemas/Community'
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
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const community = await communitiesService.getCommunity(id);
        res.json(community);
    } catch (err) {
        // Community not found
        if (err.message === "Community not found") {
            res.sendStatus(404);
        } else {
            console.error(err);
            res.sendStatus(500);
        }
    }
});

/**
 * @swagger
 * /communities:
 *   post:
 *     summary: Create a new community
 *     tags: [Communities]
 *     description: Create a new community
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Community'
 *     responses:
 *       200:
 *         description: The created community object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating the result of the operation
 *                 data:
 *                   $ref: '#/components/schemas/Community'
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
        const community = req.body;
        const result = await communitiesService.createCommunity(community);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// /**
//  * @swagger
//  * /communities/{id}:
//  *   delete:
//  *     summary: Delete a community by ID
//  *     tags: [Communities]
//  *     description: Delete a community by its ID
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         description: ID of the community to delete
//  *     responses:
//  *       200:
//  *         description: The result of the deletion
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                   description: A message indicating the result of the deletion
//  *       500:
//  *         description: Internal Server Error
//  */
// router.delete("/:id", async (req, res) => {
//     try {
//         const id = req.params.id;
//         const result = await communitiesService.deleteCommunity(id);
//         res.json(result);
//     } catch (err) {
//         console.error(err);
//         res.sendStatus(500);
//     }
// });

module.exports = router;
