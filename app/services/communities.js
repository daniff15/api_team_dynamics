const pool = require('../config/connection');

const getAllCommunities = async () => {
    const [rows] = await pool.query('SELECT * FROM communities');
    return rows;
};

const createCommunity = async (community) => {
    const [result] = await pool.query('INSERT INTO communities SET ?', community);
    return result
}

module.exports = {
    getAllCommunities,
    createCommunity
};
