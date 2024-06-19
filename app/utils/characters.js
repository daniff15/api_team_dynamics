require('dotenv').config();
const { PlayersModel, CharactersModel, CharacterLevelAttributesModel, AttributesModel, LevelsModel, CharacterElementsModel, ElementsModel, ElementRelationshipsModel, TeamPlayersModel, TeamsModel } = require('../models');
const { NotFoundError, ServerError } = require('../utils/errors');
const fs = require('fs');

// Global Variables
const MAX_FIRST_FORMULA_LEVEL = process.env.MAX_FIRST_FORMULA_LEVEL || 9;
const BASE_XP = process.env.BASE_XP || 100;
const INCREMENT = process.env.INCREMENT || 50;
const SEC_FORMULA_INCREMENT = process.env.SEC_FORMULA_INCREMENT || 500;
const INCREMENT_ATTS_FACTOR = process.env.INCREMENT_ATTS_FACTOR || 0.11;

// Utility function to include player associations inside team query
const includePlayerAssociationsInsideTeam = () => {
    return [
        {
            model: PlayersModel,
            include: [
                {
                    model: CharactersModel,
                    include: [
                        {
                            model: CharacterLevelAttributesModel,
                            include: [
                                {
                                    model: AttributesModel
                                },
                                {
                                    model: LevelsModel
                                }
                            ]
                        },
                        {
                            model: CharacterElementsModel,
                            include: [
                                {
                                    model: ElementsModel,
                                    as: 'element',
                                    include: [
                                        { 
                                            model: ElementRelationshipsModel, 
                                            as: 'strengths', 
                                            include: [{ 
                                                model: ElementsModel, 
                                                as: 'element'
                                            }] 
                                        },
                                        { 
                                            model: ElementRelationshipsModel, 
                                            as: 'weaknesses', 
                                            include: [{ 
                                                model: ElementsModel, 
                                                as: 'element'
                                            }] 
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: TeamPlayersModel,
                    include: [
                        {
                            model: TeamsModel
                        }
                    ]
                }
            ]
        }
    ];
};

// Utility function to include player associations outside team query
const includeBossesAssociations = () => {
    return [
        {
            model: CharacterLevelAttributesModel,
            include: [
                {
                    model: AttributesModel
                },
                {
                    model: LevelsModel
                }
            ]
        },
        {
            model: CharacterElementsModel,
            include: [
                {
                    model: ElementsModel,
                    as: 'element',
                    include: [
                        { 
                            model: ElementRelationshipsModel, 
                            as: 'strengths', 
                            include: [{ 
                                model: ElementsModel, 
                                as: 'element'
                            }] 
                        },
                        { 
                            model: ElementRelationshipsModel, 
                            as: 'weaknesses', 
                            include: [{ 
                                model: ElementsModel, 
                                as: 'element'
                            }] 
                        }
                    ]
                }
            ]
        }
    ]
};

const includePlayerAssociationsOutsideTeamPlayer = (player = false) => {
    const includes = [
        {
            model: CharactersModel,
            include: [
                {
                    model: CharacterLevelAttributesModel,
                    include: [
                        {
                            model: AttributesModel
                        },
                        {
                            model: LevelsModel
                        }
                    ]
                },
                {
                    model: CharacterElementsModel,
                    include: [
                        {
                            model: ElementsModel,
                            as: 'element',
                            include: [
                                { 
                                    model: ElementRelationshipsModel, 
                                    as: 'strengths', 
                                    include: [{ 
                                        model: ElementsModel, 
                                        as: 'element'
                                    }] 
                                },
                                { 
                                    model: ElementRelationshipsModel, 
                                    as: 'weaknesses', 
                                    include: [{ 
                                        model: ElementsModel, 
                                        as: 'element'
                                    }] 
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]

    if(player) {
        includes.push({
            model: TeamPlayersModel,
            include: [
                {
                    model: TeamsModel
                }
            ]
        });
    }

    return includes;
};

// Utility function to construct character response
const constructCharacterResponse = (character) => {
    return {
        id: character.id,
        ext_id: character.ext_id,
        name: character?.character ? character.character.name : character.name,
        team: character?.team_players && character.team_players[0].team.id,
        level: character?.character ? character.character.level_id : character.level,
        character_type_id: character?.character ? character.character.character_type_id : character.character_type_id,
        xp: character.xp,
        total_xp: character.total_xp,
        att_xtra_points: character.att_xtra_points,
        image_path: character?.character ? character.character.image_path : character.image_path,
        before_defeat_phrase: character.before_defeat_phrase,
        after_defeat_phrase: character.after_defeat_phrase,
        cooldown_time: character.cooldown_time,
        attributes: character?.character ? character.character.character_level_attributes.reduce((acc, attribute) => {
            acc[attribute.attribute.name] = attribute.value;
            return acc;
        }, {}) :
        character.character_level_attributes.reduce((acc, attribute) => {
            acc[attribute.attribute.name] = attribute.value;
            return acc;
        }, {}),
        elements: character?.character ? character.character.character_elements.map(element => {
            const elementData = {
                id: element.element.id,
                name: element.element.name,
                strengths: element.element.strengths.map(strength => ({ id: strength.element.id, name: strength.element.name })),
                weaknesses: element.element.weaknesses.map(weakness => ({ id: weakness.element.id, name: weakness.element.name }))
            };
            return elementData;
        }) : character.character_elements.map(element => {
            const elementData = {
                id: element.element.id,
                name: element.element.name,
                strengths: element.element.strengths.map(strength => ({ id: strength.element.id, name: strength.element.name })),
                weaknesses: element.element.weaknesses.map(weakness => ({ id: weakness.element.id, name: weakness.element.name }))
            };
            return elementData;
        })
    };
};


const updateParticipantBattleStatus = (deepCloneParticipants, participant, attr, value = 5) => {
    // Directly find and update the participant in deepCloneParticipants
    const participantIndex = deepCloneParticipants.findIndex(p => p.id === participant.id);
    if (attr === 'SPEED') {
        if (deepCloneParticipants[participantIndex].attributes.SPEED == 0) {
            deepCloneParticipants[participantIndex].attributes.SPEED = deepCloneParticipants[participantIndex].real_speed;
        } else if (deepCloneParticipants[participantIndex].attributes.SPEED - value < 0) {
            deepCloneParticipants[participantIndex].attributes.SPEED = 0;
        } else {
            deepCloneParticipants[participantIndex].attributes.SPEED -= value;
        }
    } else if (attr === 'hp_battle') {
        deepCloneParticipants[participantIndex].attributes.hp_battle = parseInt((deepCloneParticipants[participantIndex].attributes.hp_battle - value));
    }
    
};

const checkLevelUp = async (character, max_level, t) => {
    if (character.character.level_id < max_level) {
        const xp_needed = calculate_xp_needed(character);

        if (character.xp >= xp_needed) {
            character.character.level_id += 1;
            character.xp -= xp_needed;

            if (Math.random() < 0.65) {
                character.att_xtra_points += 1;
            }

            await character.character.save({ transaction: t });
            await character.save({ transaction: t });

            // Update character attributes and insert into character_level_attributes table within the same transaction
            await updateStatsAndAttributes(character, t);

            // Recursive call to check for further level ups
            await checkLevelUp(character, max_level, t);
        }
    }
};

const updateStatsAndAttributes = async (character, t) => {
    try {
        const currentAttributes = await CharacterLevelAttributesModel.findAll({
            where: { character_id: character.id, level_id: parseInt(character.character.level_id) - 1 },
            transaction: t
        });

        // Calculate new attribute values
        const newAttributes = calculateNewAttributes(currentAttributes);

        // Insert the new attribute values into the database
        await CharacterLevelAttributesModel.bulkCreate([
            { character_id: character.id, level_id: character.character.level_id, attribute_id: 1, value: currentAttributes[0].value + newAttributes.hp },
            { character_id: character.id, level_id: character.character.level_id, attribute_id: 2, value: currentAttributes[1].value + newAttributes.def },
            { character_id: character.id, level_id: character.character.level_id, attribute_id: 3, value: currentAttributes[2].value + newAttributes.atk },
            { character_id: character.id, level_id: character.character.level_id, attribute_id: 4, value: currentAttributes[3].value + newAttributes.speed }
        ], { transaction: t });

        return character;
    } catch (error) {
        return ServerError(error.message);
    }
};

const calculateNewAttributes = (currentAttributes) => {
    let newAttributes = { hp: 0, def: 0, atk: 0, speed: 0 };

    for (const attribute of currentAttributes) {
        if (attribute.attribute_id === 1) {
            newAttributes.hp += Math.ceil(attribute.value * INCREMENT_ATTS_FACTOR * (Math.random() * (1.1 - 1) + 1));
        } else if (attribute.attribute_id === 2) {
            newAttributes.def += Math.ceil(attribute.value * INCREMENT_ATTS_FACTOR * (Math.random() * (1.1 - 1) + 1));
        } else if (attribute.attribute_id === 3) {
            newAttributes.atk += Math.ceil(attribute.value * INCREMENT_ATTS_FACTOR * (Math.random() * (1.1 - 1) + 1));
        } else if (attribute.attribute_id === 4) {
            newAttributes.speed += Math.ceil(attribute.value * INCREMENT_ATTS_FACTOR * (Math.random() * (1.1 - 1) + 1));
        }
    }

    return newAttributes;
};

const calculate_xp_needed = (character) => {
    // METER ISTO A IR BUSCAR A UM FICHEIRO DE CONFIGURACAO
    if (character.character.level_id < MAX_FIRST_FORMULA_LEVEL) {
        return BASE_XP + ((character.character.level_id - 1) * INCREMENT);
    } else {
        return SEC_FORMULA_INCREMENT;
    }
}

const updateTeamTotalXP = async (playerId, transaction) => {
    try {
        // Find the team ID associated with the given player ID
        const teamCharacter = await TeamPlayersModel.findOne({ where: { player_id: playerId }, transaction });
        if (!teamCharacter) {
            return NotFoundError('Player not found in any team');
        }

        const teamId = teamCharacter.team_id;

        const characters = await TeamPlayersModel.findAll({
            where: { team_id: teamId },
            include: [{ model: PlayersModel }],
            transaction
        });

        let totalXP = 0;
        for (const character of characters) {
            totalXP += character.player.total_xp;
        }

        const team = await TeamsModel.findByPk(teamId, { transaction });
        team.total_xp = totalXP;

        await team.save({ transaction });

        return team;
    } catch (error) {
        return ServerError(error.message);
    }
};

const adjustAttributesForLevel = async (character) => {
    const currentAttributes = await CharacterLevelAttributesModel.findAll({
        where: { character_id: character.id }
    });

    for (const attribute of currentAttributes) {
        if (attribute.level_id > character.level_id) {
            await attribute.destroy();
        }
    }
};

module.exports = {
    includePlayerAssociationsInsideTeam,
    includeBossesAssociations,
    includePlayerAssociationsOutsideTeamPlayer,
    constructCharacterResponse,
    updateParticipantBattleStatus,
    checkLevelUp,
    updateTeamTotalXP,
    adjustAttributesForLevel
}