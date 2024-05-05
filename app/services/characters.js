const pool = require('../config/connection');

const getCharacters = async (filters = {}) => {
    let baseQuery = `
        SELECT 
            c.id AS character_id,
            c.name AS character_name,
            c.character_type,
            c.level,
            GROUP_CONCAT(DISTINCT CONCAT(a.name, ':', cla.value) ORDER BY a.name SEPARATOR ', ') AS attributes,
            GROUP_CONCAT(DISTINCT e.name ORDER BY e.name SEPARATOR ', ') AS elements
        FROM characters c
        LEFT JOIN character_level_attributes cla ON c.id = cla.character_id
        LEFT JOIN attributes a ON cla.attribute_id = a.id
        LEFT JOIN character_elements ce ON c.id = ce.character_id
        LEFT JOIN elements e ON ce.element_id = e.id
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

    baseQuery += ' GROUP BY c.id, c.name, c.character_type, c.level';

    const [rows] = await pool.query(baseQuery, params);

    // Process rows...
    const characters = rows.reduce((acc, row) => {
        if (!acc[row.character_id]) {
            acc[row.character_id] = {
                id: row.character_id,
                name: row.character_name,
                character_type: row.character_type,
                level: row.level,
                attributes: row.attributes ? row.attributes.split(', ').reduce((acc, attr) => {
                    const [key, value] = attr.split(':');
                    acc[key] = value;
                    return acc;
                }, {}) : {},
                elements: row.elements ? row.elements.split(', ') : []
            };
        }
        return acc;
    }, {});

    return Object.values(characters);
};

const getCharacter = async (id) => {
    const [rows] = await pool.query(`
        SELECT 
            c.id AS character_id,
            c.name AS character_name,
            c.character_type,
            c.level,
            GROUP_CONCAT(DISTINCT CONCAT(a.name, ':', cla.value) ORDER BY a.name SEPARATOR ', ') AS attributes,
            GROUP_CONCAT(DISTINCT e.name ORDER BY e.name SEPARATOR ', ') AS elements
        FROM characters c
        LEFT JOIN character_level_attributes cla ON c.id = cla.character_id
        LEFT JOIN attributes a ON cla.attribute_id = a.id
        LEFT JOIN character_elements ce ON c.id = ce.character_id
        LEFT JOIN elements e ON ce.element_id = e.id
        WHERE c.id = ?
        GROUP BY c.id, c.name, c.character_type, c.level
    `, [id]);

    if (!rows.length) {
        throw new Error('Character not found');
    }

    const row = rows[0];
    const character = {
        id: row.character_id,
        name: row.character_name,
        character_type: row.character_type,
        level: row.level,
        attributes: row.attributes.split(', ').reduce((acc, attr) => {
            const [key, value] = attr.split(':');
            acc[key] = value;
            return acc;
        }, {}),
        elements: row.elements ? row.elements.split(', ') : []
    };

    return character;
}

module.exports = {
    getCharacters,
    getCharacter
};
