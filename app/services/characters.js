const { baseAttributes } = require('../utils/baseAttributes');
const { checkLevelUp, updateTeamTotalXP, includePlayerAssociationsOutsideTeamPlayer, adjustAttributesForLevel } = require('../utils/characters');
const { constructCharacterResponse } = require('../utils/characters');
const { sequelize, CharactersModel, CharacterElementsModel, ElementsModel, CharacterLevelAttributesModel, AttributesModel, LevelsModel, TeamPlayersModel, PlayersModel, BossesModel, TeamsModel } = require('../models/index');
const { BadRequestError, NotFoundError, ServerError } = require('../utils/errors');
const { success } = require('../utils/apiResponse');
const { Op } = require('sequelize');

const getCharacters = async (filters = {}) => {
    try {
        let where = {};
        let characters = [];
        let order = [];

        if (filters.character_type) {

            if (filters.ext_id) {
                where.ext_id = filters.ext_id;
            }
            
            if (filters.character_type === 1) {
                if (filters.order_by_total_xp) {
                    order = [['total_xp', filters.order_by_total_xp]];
                }
                characters = await PlayersModel.findAll({
                    include: includePlayerAssociationsOutsideTeamPlayer(true),
                    order: order,
                    where: where
                });
            } else {
                characters = await BossesModel.findAll({
                    include: includePlayerAssociationsOutsideTeamPlayer()
                });
            }
        } else {
            // Join players and bosses
            players = await PlayersModel.findAll({
                include: includePlayerAssociationsOutsideTeamPlayer(true)
            });

            bosses = await BossesModel.findAll({
                include: includePlayerAssociationsOutsideTeamPlayer()
            });

            characters = players.concat(bosses);
        }

        const formattedCharacters = characters.map(character => (
            constructCharacterResponse(character)
        ));

        return success(formattedCharacters);
    } catch (error) {
        return ServerError(error.message);
    }
};


const getCharacter = async (characterId) => {
    try {
        let character = null;
        const characterType = await CharactersModel.findOne({
            where: { id: characterId },
            attributes: ['character_type_id']
        });

        if (!characterType) {
            return NotFoundError('Character not found');
        }

        if (characterType.character_type_id !== 1) {
            character = await BossesModel.findByPk(characterId, {
                include: includePlayerAssociationsOutsideTeamPlayer()
            });
        } else {
            character = await PlayersModel.findByPk(characterId, {
                include: includePlayerAssociationsOutsideTeamPlayer(true)
            });
        }

        const formattedCharacter = constructCharacterResponse(character);

        return success(formattedCharacter);
    } catch (error) {
        return ServerError(error.message);
    }
};

const createCharacter = async (name, ext_id='', characterType, level, elements, attributes, image_path='', before_defeat_phrase='', after_defeat_phrase='', cooldown_time) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();

        if (characterType === 0) {
            return BadRequestError('Character type must be specified');
        }

        // Prevent creating a character with more than one element
        if (characterType === 1 && elements.length !== 1) {
            return BadRequestError('Player characters can only have one element');
        }

        // Create the character
        let character;
        if (characterType === 2 || characterType === 3) {

            const maxLevel = await LevelsModel.max('level_value', { transaction });
            if (level > maxLevel) {
                return BadRequestError('Level cannot be greater than the maximum level');
            }

            character = await CharactersModel.create({
                name: name,
                character_type_id: characterType,
                level_id: level,
                image_path
            }, { transaction });
        } else {
            character = await CharactersModel.create({
                name: name,
                character_type_id: characterType,
                level_id: 1,
                image_path
            }, { transaction });
        }

        const characterId = character.id;
        if (characterType === 1) {
            if (ext_id === '') {
                return BadRequestError('External ID must be specified for player characters');
            }

            await PlayersModel.create({
                id: characterId,
                total_xp: 0,
                xp: 0,
                att_xtra_points: 0,
                ext_id
            }, { transaction });

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

            if(!cooldown_time) {
                return BadRequestError('Cooldown time must be specified for non-player characters, in seconds');
            }

            await BossesModel.create({
                id: characterId,
                before_defeat_phrase,
                after_defeat_phrase,
                cooldown_time
            }, { transaction });
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
        return success({ id: characterId}, message = 'Character created successfully', status_code = 201);
    } catch (error) {
        if (transaction) await transaction.rollback();
        return ServerError(error.message);
    }
};

const addXPtoCharacter = async (characterId, xp) => {
    const t = await sequelize.transaction();
    try {
        const maxLevel = await LevelsModel.max('level_value', { transaction: t });
        const character = await PlayersModel.findByPk(characterId, {
            include: includePlayerAssociationsOutsideTeamPlayer(true),
            transaction: t
        });

        if (!character || character.character.character_type_id !== 1) {
            if (!character) {
                return NotFoundError('Player character not found');
            } else {
                return BadRequestError('Character is not a player character');
            }
        }

        const teamMembership = await TeamPlayersModel.findOne({
            where: { player_id: characterId },
            transaction: t
        });

        if (!teamMembership) {
            return BadRequestError('Character is not a member of any team');
        }

        if (character.character.level_id === maxLevel) {
            character.xp = 0;
            character.total_xp += xp;
            await character.save({ transaction: t });
        } else {
            character.xp += xp;
            character.total_xp += xp;

            await character.save({ transaction: t });
    
            await checkLevelUp(character, maxLevel, t);
        }

        await updateTeamTotalXP(character.id, t);
        await t.commit();
        // Retrieve the updated character after the transaction is committed
        const updatedCharacter = await PlayersModel.findByPk(characterId, {
            include: includePlayerAssociationsOutsideTeamPlayer(true)
        });
        return success(constructCharacterResponse(updatedCharacter), message = 'XP added successfully');

    } catch (error) {
        // Rollback the transaction if an error occurs
        await t.rollback();
        return ServerError(error.message);
    }
};

const updateCharacterAttributes = async (characterId, increments) => {
    try {
        const character = await CharactersModel.findByPk(characterId);

        const player = await PlayersModel.findByPk(characterId);

        if (!character) {
            return NotFoundError('Character not found');
        }

        if (character.character_type_id !== 1) {
            return BadRequestError('Attributes can only be updated for player characters');
        }

        const teamMembership = await TeamPlayersModel.findOne({
            where: { player_id: characterId }
        });

        if (!teamMembership) {
            return BadRequestError('Character is not a member of any team');
        }

        const currentAttributes = await CharacterLevelAttributesModel.findAll({
            where: { character_id: characterId },
            include: [{ model: AttributesModel, attributes: ['name'] }]
        });

        const availableXtraPoints = player.att_xtra_points;

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
        await PlayersModel.update(
            { att_xtra_points: parseInt(availableXtraPoints) - totalPointsUsed },
            { where: { id: characterId } }
        );

        // After updating attributes, fetch the updated details of the player
        const updatedCharacter = await PlayersModel.findByPk(characterId, {
            include: includePlayerAssociationsOutsideTeamPlayer(true)
        });

        return success(constructCharacterResponse(updatedCharacter), message = 'Attributes updated successfully');
    } catch (error) {
        return ServerError(error.message);
    }
}
const updateCharacter = async (characterId, updates) => {
    try {
        const character = await CharactersModel.findByPk(characterId);
        if (!character) {
            return NotFoundError('Character not found');
        }

        const allowedUpdates = {
            name: updates.name,
            image_path: updates.image_path,
            element: updates.element
        };

        const updatedFields = {};
        Object.entries(allowedUpdates).forEach(([key, value]) => {
            if (value !== undefined) {
                updatedFields[key] = value;
            }
        });

        if (Object.keys(updatedFields).length === 0) {
            return BadRequestError('No valid fields to update');
        }

        if (character.character_type_id === 1) {
            const characterElement = await CharacterElementsModel.findOne({ where: { character_id: characterId } });
            const player = await PlayersModel.findByPk(characterId);
            if (updatedFields.element !== undefined && updatedFields.element !== characterElement.element_id) {
                const element = await ElementsModel.findOne({ where: { id: updatedFields.element } });

                if (!element) {
                    return NotFoundError('Element not found');
                }

                await CharacterElementsModel.update(
                    { element_id: updatedFields.element },
                    { where: { character_id: characterId } }
                );

                const newLevel = Math.max(1, character.level_id - 3);
                character.level_id = newLevel;
                player.xp = 0;
                await player.save();
                await character.save();

                adjustAttributesForLevel(character);

                await CharactersModel.update(updatedFields, { where: { id: characterId } });
            } else if (updatedFields.element === characterElement.element_id) {
                return BadRequestError('Element cannot be updated since it is already that element');
            } else {
                await CharactersModel.update(updatedFields, { where: { id: characterId } });
            }
        } else { 
            if (updatedFields.element !== undefined) {
                return BadRequestError('Element cannot be updated for non-player characters');
            }

            await CharactersModel.update(updatedFields, { where: { id: characterId } });
        }

        let updatedCharacter = await CharactersModel.findByPk(characterId);
        
        if (updatedCharacter.character_type_id === 1) {
            updatedCharacter = await PlayersModel.findByPk(characterId, {
                include: includePlayerAssociationsOutsideTeamPlayer(true)
            });
        } else {
            [updatedCharacter] = await BossesModel.findAll({
                include: includePlayerAssociationsOutsideTeamPlayer()
            });
        }
        return success(constructCharacterResponse(updatedCharacter), message = 'Character updated successfully');
    } catch (error) {
        return ServerError(error.message);
    }
};

const transferExtraPoints = async (from_player_id, to_player_id, points) => {
    try {
        const from_player = await PlayersModel.findByPk(from_player_id);
        const to_player = await PlayersModel.findByPk(to_player_id);

        if (!from_player) {
            return NotFoundError('From player not found');
        }

        if (!to_player) {
            return NotFoundError('To player not found');
        }

        const teamMembershipFrom = await TeamPlayersModel.findOne({
            where: { player_id: from_player_id }
        });

        const teamMembershipTo = await TeamPlayersModel.findOne({
            where: { player_id: to_player_id }
        });

        if (!teamMembershipFrom || !teamMembershipTo) {
            return BadRequestError('Both players must be members of a team');
        }

        if (teamMembershipFrom.team_id !== teamMembershipTo.team_id) {
            return BadRequestError('Players are not on the same team');
        }

        const availableXtraPoints = parseInt(from_player.att_xtra_points);

        if (points <= 0) {
            return BadRequestError('Points must be a positive integer');
        }

        if (points > availableXtraPoints) {
            return BadRequestError('Insufficient extra points to transfer');
        }

        // Update the extra points for both players
        await PlayersModel.update(
            { att_xtra_points: availableXtraPoints - points },
            { where: { id: from_player_id } }
        );

        await PlayersModel.update(
            { att_xtra_points: parseInt(to_player.att_xtra_points) + points },
            { where: { id: to_player_id } }
        );

        // Fetch the updated details of both players
        const updatedfrom_player = await PlayersModel.findByPk(from_player_id, {
            include: includePlayerAssociationsOutsideTeamPlayer(true)
        });
        const updatedto_player = await PlayersModel.findByPk(to_player_id, {
            include: includePlayerAssociationsOutsideTeamPlayer(true)
        });

        return success({
            from_player: constructCharacterResponse(updatedfrom_player),
            to_player: constructCharacterResponse(updatedto_player)
        }, 'Points transferred successfully');
    } catch (error) {
        return ServerError(error.message);
    }
};
  

const deleteCharacter = async (characterId) => {
    try {
        const character = await CharactersModel.findByPk(characterId);

        if (!character) {
            return NotFoundError('Character not found');
        }

        const teamPlayer = await TeamPlayersModel.findOne({ where: { player_id: characterId } });
        const team = await TeamsModel.findByPk(teamPlayer.team_id);
        if(teamPlayer) {
            if (team.owner_id == characterId) {
                const anotherTeamMember = await TeamPlayersModel.findOne({
                    where: { team_id: team.id, player_id: { [Op.ne]: characterId } }
                });

                if (anotherTeamMember) {
                    team.owner_id = anotherTeamMember.player_id;
                    await team.save();
                } else {
                    await team.destroy();
                }
            }
        }

        await character.destroy();

        return success({}, message = 'Character deleted successfully');
    } catch (error) {
        return ServerError(error.message);
    }
};

module.exports = {
    getCharacters,
    getCharacter,
    createCharacter,
    addXPtoCharacter,
    updateCharacterAttributes,
    updateCharacter,
    transferExtraPoints,
    deleteCharacter
};
