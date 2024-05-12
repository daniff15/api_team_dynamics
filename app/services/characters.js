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

const addXPtoCharacter = async (characterId, xp) => {
    try {
        const character = await CharactersModel.findByPk(characterId);

        if (!character || character.character_type !== 1) {
            throw new Error('Character not found or is not a player character');
        }

        character.xp += xp;

        await character.save();

        return { message: 'XP added successfully' };
    } catch (error) {
        throw error;
    }
};


const updateCharacterAttributes = async (characterId, increments) => {
    try {
        const character = await CharactersModel.findByPk(characterId, {
            include: includePlayerAssociationsOutsideTeam()
        });

        if (!character) {
            throw new Error('Character not found');
        }

        if (character.character_type_id !== 1) {
            throw new Error('Attributes can only be updated for player characters');
        }

        const currentAttributes = await CharacterLevelAttributesModel.findAll({
            where: { character_id: characterId },
            include: [{ model: AttributesModel, attributes: ['name'] }]
        });

        const availableXtraPoints = character.att_xtra_points;

        const attributeMap = new Map(currentAttributes.map(attr => [attr.attribute.name, attr]));
        const totalPointsUsed = Object.values(increments).reduce((acc, increment) => acc + parseInt(increment), 0);

        if (totalPointsUsed > parseInt(availableXtraPoints)) {
            throw new Error('Insufficient extra points to update attributes');
        }
        
        for (const [key, increment] of Object.entries(increments)) {
            if (attributeMap.has(key)) {
                const currentAttribute = attributeMap.get(key);
                const incrementValue = parseInt(increment);

                const newValue = parseInt(currentAttribute.value) + incrementValue;
                await CharacterLevelAttributesModel.update(
                    { value: newValue },
                    { where: { character_id: characterId, attribute_id: currentAttribute.attribute_id } }
                );
            } else {
                throw new Error(`Attribute ${key} not found or not updatable`);
            }
        }

        // Deduct the used extra points
        await CharactersModel.update(
            { att_xtra_points: parseInt(availableXtraPoints) - totalPointsUsed },
            { where: { id: characterId } }
        );

        // After updating attributes, fetch the updated details of the player
        const updatedCharacter = await CharactersModel.findByPk(characterId, {
            include: includePlayerAssociationsOutsideTeam()
        });

        if (!updatedCharacter) {
            throw new Error('Character details not found after update');
        }

        return constructPlayerResponse(updatedCharacter);
    } catch (error) {
        throw error;
    }
}


module.exports = {
    getCharacters,
    getCharacter,
    createCharacter,
    addXPtoCharacter,
    updateCharacterAttributes
};
