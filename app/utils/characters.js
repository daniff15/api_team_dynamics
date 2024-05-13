const { CharactersModel, CharacterLevelAttributesModel, AttributesModel, LevelsModel, CharacterElementsModel, ElementsModel, ElementRelationshipsModel, TeamCharactersModel, TeamsModel } = require('../models');

// Utility function to include player associations inside team query
const includePlayerAssociationsInsideTeam = () => {
    return [
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
    ];
};

// Utility function to include player associations outside team query
const includePlayerAssociationsOutsideTeam = () => {
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

// Utility function to construct player response
const constructPlayerResponse = (character) => {
    return {
        id: character.id,
        name: character.name,
        level: character.level_id,
        xp: character.xp,
        total_xp: character.total_xp,
        extra_points: character.att_xtra_points,
        attributes: character.character_level_attributes.reduce((acc, attribute) => {
            acc[attribute.attribute.name] = attribute.value;
            return acc;
        }, {}),
        elements: character.character_elements.map(element => {
            const elementData = {
                id: element.element.id,
                name: element.element.name,
                strengths: element.element.strengths.map(strength => strength.element.name),
                weaknesses: element.element.weaknesses.map(weakness => weakness.element.name)
            };
            return elementData;
        }),
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
        deepCloneParticipants[participantIndex].attributes.hp_battle -= value;
    }
    
};

const checkLevelUp = async (character, max_level, t) => {
    if (character.level_id < max_level) {
        const xp_needed = calculate_xp_needed(character);

        if (character.xp >= xp_needed) {
            character.level_id += 1;
            character.xp -= xp_needed;

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
            where: { character_id: character.id, level_id: parseInt(character.level_id) - 1 },
            transaction: t
        });

        // Calculate new attribute values
        const newAttributes = calculateNewAttributes(currentAttributes);

        // Insert the new attribute values into the database
        await CharacterLevelAttributesModel.bulkCreate([
            { character_id: character.id, level_id: character.level_id, attribute_id: 1, value: currentAttributes[0].value + newAttributes.hp },
            { character_id: character.id, level_id: character.level_id, attribute_id: 2, value: currentAttributes[1].value + newAttributes.def },
            { character_id: character.id, level_id: character.level_id, attribute_id: 3, value: currentAttributes[2].value + newAttributes.atk },
            { character_id: character.id, level_id: character.level_id, attribute_id: 4, value: currentAttributes[3].value + newAttributes.speed }
        ], { transaction: t });

        return character;
    } catch (error) {
        console.error('Error updating character attributes:', error);
        throw error;
    }
};

const calculateNewAttributes = (currentAttributes, scaling_factor = 0.11) => {
    let newAttributes = { hp: 0, def: 0, atk: 0, speed: 0 };

    for (const attribute of currentAttributes) {
        if (attribute.attribute_id === 1) {
            newAttributes.hp += Math.ceil(attribute.value * scaling_factor * (Math.random() * (1.1 - 1) + 1));
        } else if (attribute.attribute_id === 2) {
            newAttributes.def += Math.ceil(attribute.value * scaling_factor * (Math.random() * (1.1 - 1) + 1));
        } else if (attribute.attribute_id === 3) {
            newAttributes.atk += Math.ceil(attribute.value * scaling_factor * (Math.random() * (1.1 - 1) + 1));
        } else if (attribute.attribute_id === 4) {
            newAttributes.speed += Math.ceil(attribute.value * scaling_factor * (Math.random() * (1.1 - 1) + 1));
        }
    }

    return newAttributes;
};

const MAX_FIRST_FORMULA_LEVEL = 9;
const BASE_XP = 100;
const INCREMENT = 50;
const SEC_FORMULA_INCREMENT = 500;
const calculate_xp_needed = (character) => {
    // METER ISTO A IR BUSCAR A UM FICHEIRO DE CONFIGURACAO
    if (character.level_id < MAX_FIRST_FORMULA_LEVEL) {
        return BASE_XP + ((character.level_id - 1) * INCREMENT);
    } else {
        return SEC_FORMULA_INCREMENT;
    }
}

const updateTeamTotalXP = async (playerId) => {
    try {
        // Find the team ID associated with the given player ID
        const teamCharacter = await TeamCharactersModel.findOne({ where: { character_id: playerId } });
        if (!teamCharacter) {
            throw new Error('Player not found in any team');
        }

        const teamId = teamCharacter.team_id;

        const characters = await TeamCharactersModel.findAll({
            where: { team_id: teamId },
            include: [{ model: CharactersModel }]
        });

        let totalXP = 0;
        for (const character of characters) {
            totalXP += character.character.total_xp;
        }

        const team = await TeamsModel.findByPk(teamId);
        team.total_xp = totalXP;
        await team.save();

        return team;
    } catch (error) {
        console.error('Error updating team total XP:', error);
        throw error;
    }
};


module.exports = {
    includePlayerAssociationsInsideTeam,
    includePlayerAssociationsOutsideTeam,
    constructPlayerResponse,
    updateParticipantBattleStatus,
    checkLevelUp,
    updateTeamTotalXP   
};