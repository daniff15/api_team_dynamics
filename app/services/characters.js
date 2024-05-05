const pool = require('../config/connection');

const getCharacters = async (filters = {}) => {
    let baseQuery = `
        SELECT 
            c.id AS character_id,
            c.name AS character_name,
            c.character_type,
            c.level,
            a.name AS attribute_name,
            cla.value AS attribute_value
        FROM characters c
        JOIN character_level_attributes cla ON c.id = cla.character_id
        JOIN attributes a ON cla.attribute_id = a.id
    `;
    const conditions = [];
    const params = [];

    if (filters.character_type) {
        conditions.push('c.character_type = ?');
        params.push(filters.character_type);
    }

    if (conditions.length) {
        baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const [rows] = await pool.query(baseQuery, params);

    // Group results by character to format output
    const characters = rows.reduce((acc, row) => {
        if (!acc[row.character_id]) {
            acc[row.character_id] = {
                id: row.character_id,
                name: row.character_name,
                character_type: row.character_type,
                level: row.level,
                attributes: {}
            };
        }
        acc[row.character_id].attributes[row.attribute_name] = row.attribute_value;
        return acc;
    }, {});

    return Object.values(characters);
};


module.exports = {
    getCharacters
};
