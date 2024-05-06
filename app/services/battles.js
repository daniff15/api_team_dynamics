const pool = require('../config/connection');

const getAllBattles = async () => {
    const [rows] = await pool.query('SELECT * FROM battles');
    return rows;
};

module.exports = {
    getAllBattles,
};
