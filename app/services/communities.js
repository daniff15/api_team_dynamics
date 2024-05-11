const pool = require('../config/connection');
const { CommunitiesModel } = require('../models/index');


const getAllCommunities = async () => {
    const communities = await CommunitiesModel.findAll({});
    return communities;
};

const getCommunity = async (id) => {
    const [rows] = await pool.query('SELECT * FROM communities WHERE id = ?', id);
    return rows[0];
}

const createCommunity = async (community) => {
    const [result] = await pool.query('INSERT INTO communities SET ?', community);
    return result
}

const deleteCommunity = async (id) => {
    const [result] = await pool.query('DELETE FROM communities WHERE id = ?', id);
    return result
}

module.exports = {
    getAllCommunities,
    getCommunity,
    createCommunity,
    deleteCommunity
};
