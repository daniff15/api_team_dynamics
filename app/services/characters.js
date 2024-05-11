const pool = require('../config/connection');
const { baseAttributes } = require('../utils/baseAttributes');
const { checkLevelUp } = require('../utils/characters');
const { includePlayerAssociationsOutsideTeam, constructPlayerResponse } = require('../utils/characters');
const { sequelize, CharactersModel, CharacterElementsModel, ElementsModel, CharacterLevelAttributesModel, AttributesModel } = require('../models/index');

const getCharacters = async (filters = {}) => {
    try {
        let where = {};

        if (filters.character_type) {
            where.character_type_id = filters.character_type;
        }

        const characters = await CharactersModel.findAll({
            where: where,
            include: includePlayerAssociationsOutsideTeam()
        });
        
        const formattedCharacters = characters.map(character => (
            constructPlayerResponse(character)
        ));

        return formattedCharacters;
    } catch (error) {
        throw error;
    }
};

const getCharacter = async (characterId) => {
    try {
        const character = await CharactersModel.findByPk(characterId, {
            include: includePlayerAssociationsOutsideTeam()
        });

        if (!character) {
            throw new Error('Character not found');
        }

        const formattedCharacter = constructPlayerResponse(character);

        return formattedCharacter;
    } catch (error) {
        throw error;
    }
};

const createCharacter = async (name, characterType, level, elements, attributes) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();

        // Prevent creating a character with more than one element
        if (characterType === 1 && elements.length !== 1) {
            throw new Error('Players must have exactly one element.');
        }

        // Create the character
        let character;
        if (characterType !== 1) {
            character = await CharactersModel.create({
                name: name,
                character_type_id: characterType,
                level_id: level
            }, { transaction });
        } else {
            character = await CharactersModel.create({
                name: name,
                character_type_id: characterType,
                level_id: 1,
                xp: 0,
                att_xtra_points: 0
            }, { transaction });
        }

        const characterId = character.id;
        if (characterType === 1) {
            // Fetch attributes based on elements
            const element = await ElementsModel.findByPk(elements[0], { transaction });

            if (!element) {
                throw new Error('Element not found');
            }

            // Associate elements with the character
            await CharacterElementsModel.bulkCreate(elements.map(elementId => ({
                character_id: characterId,
                element_id: elementId
            })), { transaction });

            const attrs = baseAttributes[element.name.toLowerCase()];
            if (!attrs) {
                throw new Error('Attributes not defined for the element');
            }

            // Batch insert attributes for efficiency
            await CharacterLevelAttributesModel.bulkCreate(attrs.map((value, index) => ({
                character_id: characterId,
                level_id: 1,
                attribute_id: index + 1,
                value: value
            })), { transaction });
        } else {
            for (const elementId of elements) {
                const element = await ElementsModel.findByPk(elementId, { transaction });

                if (!element) {
                    throw new Error('Element not found');
                }

                console.log("ELEMENT: ", element);

                await CharacterElementsModel.create({
                    character_id: characterId,
                    element_id: elementId
                }, { transaction });
            }

            // Insert non-player character attributes
            for (const [attribute, value] of Object.entries(attributes)) {
                const attr = await AttributesModel.findOne({ where: { name: attribute } });

                if (!attr) {
                    throw new Error(`Attribute "${attribute}" not found`);
                }

                await CharacterLevelAttributesModel.create({
                    character_id: characterId,
                    level_id: level,
                    attribute_id: attr.id,
                    value: value
                }, { transaction });
            }
        }

        await transaction.commit();
        return { id: characterId, message: "Character created successfully" };
    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }
};

// const addXPtoCharacter = async (characterId, xp) => {
//     const [max_level] = await pool.query('SELECT MAX(level) AS max_level FROM levels');
//     const [character] = await pool.query(`
//         SELECT 
//             c.id AS character_id,
//             c.character_type,
//             c.level,
//             JSON_OBJECTAGG(a.name, cla.value) AS attributes
//         FROM characters c
//         LEFT JOIN character_level_attributes cla ON c.id = cla.character_id
//         LEFT JOIN attributes a ON cla.attribute_id = a.id
//         WHERE c.id = ?
//         GROUP BY c.id, c.character_type, c.level;

//     `, [characterId]);

//     if (!character.length) {
//         throw new Error('Character not found');
//     }

//     if (character[0].character_type !== 1) {
//         throw new Error('XP can only be added to player characters');
//     }

//     const [currentLevel] = await pool.query(`
//         SELECT MAX(level_id) AS current_level FROM character_level_attributes WHERE character_id = ?
//     `, [characterId]);

//     const leveledUp = checkLevelUp(character[0], max_level[0].max_level);

//     console.log("LEVELED UP: ", leveledUp);
//     return;

//     const newLevel = currentLevel[0].current_level + 1;
//     const [[{id: xpAttributeId}]] = await pool.query('SELECT id FROM attributes WHERE name = "XP"');

//     await pool.query(`
//         INSERT INTO character_level_attributes (character_id, level_id, attribute_id, value)
//         VALUES (?, ?, ?, ?)
//     `, [characterId, newLevel, xpAttributeId, xp]);

//     return { message: 'XP added successfully' };
// }

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

        const [[available_xtra_points]] = await connection.query(`
            SELECT c.att_xtra_points AS current_value
            FROM characters c
            WHERE c.id = ?
        `, [characterId]);

        const attributeMap = new Map(currentAttributes.map(attr => [attr.attribute_name, attr]));

        const getsumincrementsvalues = Object.values(increments).reduce((acc, increment) => acc + parseInt(increment), 0);
        
        if (getsumincrementsvalues > parseInt(available_xtra_points.current_value)) {
            throw new Error('Insufficient extra points to update attributes');
        }
        
        let totalPointsUsed = 0;
        for (const [key, increment] of Object.entries(increments)) {
            if (attributeMap.has(key)) {
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
            'UPDATE characters SET att_xtra_points = ? WHERE id = ?',
            [parseInt(available_xtra_points.current_value) - totalPointsUsed, characterId]
        );

        // After updating attributes, fetch the updated details of the player
        const [updatedAttributes] = await connection.query(`
            SELECT 
                c.id AS character_id,
                c.name AS character_name,
                c.character_type,
                c.level,
                c.xp,
                c.att_xtra_points,
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
            xp: row.xp,
            att_xtra_points: row.att_xtra_points,  
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
    // addXPtoCharacter,
    updateCharacterAttributes
};
