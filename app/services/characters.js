const pool = require('../config/connection');
const { baseAttributes, complementars } = require('../utils/baseAttributes');

const getCharacters = async (filters = {}) => {
    let baseQuery = `
        SELECT 
            c.id AS character_id,
            c.name AS character_name,
            c.character_type,
            c.level,
            tc.team_id AS team_id,
            GROUP_CONCAT(DISTINCT CONCAT(a.name, ':', cla.value) ORDER BY a.name SEPARATOR ', ') AS attributes,
            GROUP_CONCAT(DISTINCT e.name ORDER BY e.name SEPARATOR ', ') AS elements
        FROM characters c
        LEFT JOIN character_level_attributes cla ON c.id = cla.character_id
        LEFT JOIN attributes a ON cla.attribute_id = a.id
        LEFT JOIN character_elements ce ON c.id = ce.character_id
        LEFT JOIN elements e ON ce.element_id = e.id
        LEFT JOIN team_characters tc ON c.id = tc.character_id
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

    // Include tc.team_id in GROUP BY to satisfy ONLY_FULL_GROUP_BY SQL mode
    baseQuery += ' GROUP BY c.id, c.name, c.character_type, c.level, tc.team_id';

    const [rows] = await pool.query(baseQuery, params);

    // Process rows...
    const characters = rows.map(row => ({
        id: row.character_id,
        name: row.character_name,
        character_type: row.character_type,
        level: row.level,
        team_id: row.team_id || null,  // Null if not part of any team
        attributes: row.attributes ? row.attributes.split(', ').reduce((acc, attr) => {
            const [key, value] = attr.split(':');
            acc[key] = value;
            return acc;
        }, {}) : {},
        elements: row.elements ? row.elements.split(', ') : []
    }));

    return characters;
};


const getCharacter = async (id) => {
    const [rows] = await pool.query(`
        SELECT 
            c.id AS character_id,
            c.name AS character_name,
            c.character_type,
            c.level,
            tc.team_id AS team_id,
            GROUP_CONCAT(DISTINCT CONCAT(a.name, ':', cla.value) ORDER BY a.name SEPARATOR ', ') AS attributes,
            GROUP_CONCAT(DISTINCT e.name ORDER BY e.name SEPARATOR ', ') AS elements
        FROM characters c
        LEFT JOIN character_level_attributes cla ON c.id = cla.character_id
        LEFT JOIN attributes a ON cla.attribute_id = a.id
        LEFT JOIN character_elements ce ON c.id = ce.character_id
        LEFT JOIN elements e ON ce.element_id = e.id
        LEFT JOIN team_characters tc ON c.id = tc.character_id  -- Joining with team_characters to get team_id
        WHERE c.id = ?
        GROUP BY c.id, c.name, c.character_type, c.level, tc.team_id  -- Including team_id in GROUP BY
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
        team_id: row.team_id,  
        attributes: {},
        elements: row.elements ? row.elements.split(', ') : []
    };

    // Processing attributes if any
    if (row.attributes) {
        character.attributes = row.attributes.split(', ').reduce((acc, attr) => {
            const [key, value] = attr.split(':');
            acc[key] = value;
            return acc;
        }, {});
    }

    return character;
}


const createCharacter = async (name, characterType, level, elements, attributes) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction(); 

        // Prevent creating a character with more than one element
        if (characterType === 1 && elements.length !== 1) {
            throw new Error('Players must have exactly one element.');
        }

        // Prevent creating a character with level > 1
        const finalLevel = characterType === 1 ? 1 : level;
        const [character] = await connection.query(
            'INSERT INTO characters (name, character_type, level) VALUES (?, ?, ?)',
            [name, characterType, finalLevel]
        );

        const characterId = character.insertId;
        for (const elementId of elements) {
            await connection.query(
                'INSERT INTO character_elements (character_id, element_id) VALUES (?, ?)',
                [characterId, elementId]
            );
        }

        if (characterType === 1) {
            const [element] = await connection.query(
                'SELECT name FROM elements WHERE id = ?',
                [elements[0]]
            );

            if (!element.length) {
                throw new Error('Element not found');
            }

            const attrs = baseAttributes[element[0].name.toLowerCase()];
            if (!attrs) {
                throw new Error('Attributes not defined for the element');
            }

            // Batch insert attributes for efficiency
            const attributeInserts = attrs.map((value, index) => [
                characterId, finalLevel, index + 1, value
            ]);
            await connection.query(
                'INSERT INTO character_level_attributes (character_id, level_id, attribute_id, value) VALUES ?',
                [attributeInserts]
            );

            // Insert complementar attributes [XP, AVAILABLE_XTRA_POINTS]
            for (const complementar of complementars) {
                const [[{id: attributeId}]] = await connection.query(
                    'SELECT id FROM attributes WHERE name = ?',
                    [complementar]
                );

                await connection.query(
                    'INSERT INTO character_level_attributes (character_id, level_id, attribute_id, value) VALUES (?, ?, ?, ?)',
                    [characterId, finalLevel, attributeId, 0]
                );
            }
        } else {
            // Insert non-player character attributes
            for (const [attribute, value] of Object.entries(attributes)) {
                const [[{id: attributeId}]] = await connection.query(
                    'SELECT id FROM attributes WHERE name = ?',
                    [attribute]
                );

                await connection.query(
                    'INSERT INTO character_level_attributes (character_id, level_id, attribute_id, value) VALUES (?, ?, ?, ?)',
                    [characterId, finalLevel, attributeId, value]
                );
            }
        }

        await connection.commit(); 
        return { id: characterId, message: "Character created successfully" };
    } catch (error) {
        await connection.rollback(); 
        throw error;
    } finally {
        connection.release();
    }
};

const updateCharacterAttributes = async (characterId, increments) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [currentAttributes] = await connection.query(`
            SELECT cla.attribute_id, a.name AS attribute_name, cla.value AS current_value
            FROM character_level_attributes cla
            JOIN attributes a ON cla.attribute_id = a.id
            WHERE cla.character_id = ?
        `, [characterId]);

        const available_xtra_points = currentAttributes.find(attr => attr.attribute_name === 'AVAILABLE_XTRA_POINTS');

        const attributeMap = new Map(currentAttributes.map(attr => [attr.attribute_name, attr]));

        const getsumincrementsvalues = Object.values(increments).reduce((acc, increment) => acc + parseInt(increment), 0);
        
        if (getsumincrementsvalues > parseInt(available_xtra_points.current_value)) {
            throw new Error('Insufficient extra points to update attributes');
        }
        
        let totalPointsUsed = 0;
        for (const [key, increment] of Object.entries(increments)) {
            if (attributeMap.has(key) && !complementars.includes(key)) {
                const currentAttribute = attributeMap.get(key);
                const incrementValue = parseInt(increment);

                const newValue = parseInt(currentAttribute.current_value) + incrementValue;
                await connection.query(
                    'UPDATE character_level_attributes SET value = ? WHERE character_id = ? AND attribute_id = ?',
                    [newValue, characterId, currentAttribute.attribute_id]
                );
                totalPointsUsed += incrementValue;
            } else {
                throw new Error(`Attribute ${key} not found or not updatable`);
            }
        }

        // Deduct the used extra points
        await connection.query(
            'UPDATE character_level_attributes SET `value` = ? WHERE character_id = ? AND attribute_id = (SELECT id FROM attributes WHERE name = "AVAILABLE_XTRA_POINTS")',
            [parseInt(available_xtra_points.current_value) - totalPointsUsed, characterId]
        );

        // After updating attributes, fetch the updated details of the player
        const [updatedAttributes] = await connection.query(`
            SELECT 
                c.id AS character_id,
                c.name AS character_name,
                c.character_type,
                c.level,
                tc.team_id AS team_id,
                GROUP_CONCAT(DISTINCT CONCAT(a.name, ':', cla.value) ORDER BY a.name SEPARATOR ', ') AS attributes,
                GROUP_CONCAT(DISTINCT e.name ORDER BY e.name SEPARATOR ', ') AS elements
            FROM characters c
            LEFT JOIN character_level_attributes cla ON c.id = cla.character_id
            LEFT JOIN attributes a ON cla.attribute_id = a.id
            LEFT JOIN character_elements ce ON c.id = ce.character_id
            LEFT JOIN elements e ON ce.element_id = e.id
            LEFT JOIN team_characters tc ON c.id = tc.character_id  
            WHERE c.id = ?
            GROUP BY c.id, c.name, c.character_type, c.level, tc.team_id
        `, [characterId]);

        await connection.commit();

        const row = updatedAttributes[0];
        const character = {
            id: row.character_id,
            name: row.character_name,
            character_type: row.character_type,
            level: row.level,
            team_id: row.team_id,  
            attributes: {},
            elements: row.elements ? row.elements.split(', ') : []
        };

        if (row.attributes) {
            character.attributes = row.attributes.split(', ').reduce((acc, attr) => {
                const [key, value] = attr.split(':');
                acc[key] = value;
                return acc;
            }, {});
        }

        return character;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}


const deleteCharacter = async (id) => {
    const [result] = await pool.query('DELETE FROM characters WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
        throw new Error('Character not found');
    }

    return result;
};

module.exports = {
    getCharacters,
    getCharacter,
    createCharacter,
    deleteCharacter,
    updateCharacterAttributes
};
