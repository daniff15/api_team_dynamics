const { baseAttributes } = require('../utils/baseAttributes');
const { checkLevelUp, updateTeamTotalXP } = require('../utils/characters');
const { includePlayerAssociationsOutsideTeam, constructPlayerResponse } = require('../utils/characters');
const { sequelize, CharactersModel, CharacterElementsModel, ElementsModel, CharacterLevelAttributesModel, AttributesModel, LevelsModel } = require('../models/index');
const { BadRequestError, NotFoundError, ServerError } = require('../utils/errors');

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
        return ServerError(error.message);
    }
};

const getCharacter = async (characterId) => {
    try {
        const character = await CharactersModel.findByPk(characterId, {
            include: includePlayerAssociationsOutsideTeam()
        });

        if (!character) {
            return NotFoundError('Character not found');
        }

        const formattedCharacter = constructPlayerResponse(character);

        return formattedCharacter;
    } catch (error) {
        return ServerError(error.message);
    }
};

const createCharacter = async (name, characterType, level, elements, attributes) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();

        // Prevent creating a character with more than one element
        if (characterType === 1 && elements.length !== 1) {
            return BadRequestError('Player characters can only have one element');
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
                return NotFoundError('Element not found');
            }

            // Associate elements with the character
            await CharacterElementsModel.bulkCreate(elements.map(elementId => ({
                character_id: characterId,
                element_id: elementId
            })), { transaction });

            const attrs = baseAttributes[element.name.toLowerCase()];
            if (!attrs) {
                return NotFoundError('Attributes not found for element');
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
                    return NotFoundError('Element not found');
                }

                await CharacterElementsModel.create({
                    character_id: characterId,
                    element_id: elementId
                }, { transaction });
            }

            // Insert non-player character attributes
            for (const [attribute, value] of Object.entries(attributes)) {
                const attr = await AttributesModel.findOne({ where: { name: attribute } });

                if (!attr) {
                    return NotFoundError(`Attribute "${attribute}" not found`);
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
        return ServerError(error.message);
    }
};

const addXPtoCharacter = async (characterId, xp) => {
    const t = await sequelize.transaction();
    try {
        const maxLevel = await LevelsModel.max('level_value', { transaction: t });
        const character = await CharactersModel.findByPk(characterId, {
            include: includePlayerAssociationsOutsideTeam(),
            transaction: t
        });

        if (!character || character.character_type_id !== 1) {
            if (!character) {
                return NotFoundError('Player character not found');
            } else {
                return BadRequestError('Character is not a player character');
            }
        }

        if (character.level_id === maxLevel) {
            character.xp = 0;
            character.total_xp += xp;
            await character.save({ transaction: t });
            await t.commit();
        } else {
            character.xp += xp;
            character.total_xp += xp;
            await character.save({ transaction: t });
    
            await checkLevelUp(character, maxLevel, t);
    
            // Commit the transaction
            await t.commit();
        }

        await updateTeamTotalXP(character.id);
        // Retrieve the updated character after the transaction is committed
        const updatedCharacter = await CharactersModel.findByPk(characterId, {
            include: includePlayerAssociationsOutsideTeam()
        });
        return constructPlayerResponse(updatedCharacter);

    } catch (error) {
        // Rollback the transaction if an error occurs
        await t.rollback();
        return ServerError(error.message);
    }
};



const updateCharacterAttributes = async (characterId, increments) => {
    try {
        const character = await CharactersModel.findByPk(characterId, {
            include: includePlayerAssociationsOutsideTeam()
        });

        if (!character) {
            return NotFoundError('Character not found');
        }

        if (character.character_type_id !== 1) {
            return BadRequestError('Attributes can only be updated for player characters');
        }

        const currentAttributes = await CharacterLevelAttributesModel.findAll({
            where: { character_id: characterId },
            include: [{ model: AttributesModel, attributes: ['name'] }]
        });

        const availableXtraPoints = character.att_xtra_points;

        const attributeMap = new Map(currentAttributes.map(attr => [attr.attribute.name, attr]));
        const totalPointsUsed = Object.values(increments).reduce((acc, increment) => acc + parseInt(increment), 0);

        if (totalPointsUsed > parseInt(availableXtraPoints)) {
            return BadRequestError('Insufficient extra points to update attributes');
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
                return NotFoundError(`Attribute ${key} not found or not updatable`);
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
            return NotFoundError('Character not found');
        }

        return constructPlayerResponse(updatedCharacter);
    } catch (error) {
        return ServerError(error.message);
    }
}


module.exports = {
    getCharacters,
    getCharacter,
    createCharacter,
    addXPtoCharacter,
    updateCharacterAttributes
};
