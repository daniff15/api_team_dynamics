const { CharactersModel, CharacterLevelAttributesModel, AttributesModel, LevelsModel, CharacterElementsModel, ElementsModel, ElementRelationshipsModel } = require('../models');

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
        if (deepCloneParticipants[participantIndex].attributes.SPEED - value < 0) {
            deepCloneParticipants[participantIndex].attributes.SPEED = 0;
        } else if (deepCloneParticipants[participantIndex].attributes.SPEED === 0) {
            deepCloneParticipants[participantIndex].attributes.SPEED = participants[participantIndex].attributes.SPEED;
        } else {
            deepCloneParticipants[participantIndex].attributes.SPEED -= value;
        }
    } else if (attr === 'hp_battle') {
        deepCloneParticipants[participantIndex].attributes.hp_battle -= value;
    }
    
};

const checkLevelUp = (character, max_level) => {
    if (character.level < max_level) {
        const xp_needed = calculate_xp_needed(character);


        //FAZER ESTA PARTE ANTES DE CONTINUAR!
        if (character.xp >= xp_needed) {
            character.level += 1;
            character.xp -= xp_needed;
            update_stats(character);
            checkLevelUp(character);
        }
    }
};

const MAX_FIRST_FORMULA_LEVEL = 9;
const BASE_XP = 100;
const INCREMENT = 50;
const SEC_FORMULA_INCREMENT = 500;
const calculate_xp_needed = (character) => {
    // METER ISTO A IR BUSCAR A UM FICHEIRO DE CONFIGURACAO
    if (character.level < MAX_FIRST_FORMULA_LEVEL) {
        return BASE_XP + ((character.level - 1) * INCREMENT);
    } else {
        return SEC_FORMULA_INCREMENT;
    }
}

// if self.level < self.MAX_LEVEL:
//             xp_needed = self.calculate_xp_needed()
            
//             if self.xp >= xp_needed:
//                 self.level += 1
//                 self.xp -= xp_needed
//                 self.update_stats()
                
//                 # # Generate extra points with a 30% probability
//                 # if random.random() < 0.3:
//                 #     self.extra_points += 1
                
//                 self.check_level_up()

module.exports = {
    includePlayerAssociationsInsideTeam,
    includePlayerAssociationsOutsideTeam,
    constructPlayerResponse,
    updateParticipantBattleStatus,
    checkLevelUp
};