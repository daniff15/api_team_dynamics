const { ElementsModel, AttributesModel, LevelsModel, ElementRelationshipsModel } = require("../models");
const { success } = require("../utils/apiResponse");
const { BadRequestError, ServerError, NotFoundError } = require("../utils/errors");

const getAllElements = async () => {
    try {
        // Fetch all elements with their relationships
        const elements = await ElementsModel.findAll({
            include: [
                {
                    model: ElementRelationshipsModel,
                },
            ],
        });

        // Create a map of element IDs to their names
        const elementNamesMap = {};
        elements.forEach(element => {
            elementNamesMap[element.id] = element.name;
        });

        // Process the elements to structure the response
        const formattedElements = elements.map(element => {
            const strengths = [];
            const weaknesses = [];

            element.element_relationships.forEach(relationship => {
                if (relationship.strong_against_id) {
                    strengths.push({
                        id: relationship.strong_against_id,
                        name: elementNamesMap[relationship.strong_against_id],
                    });
                }
                if (relationship.weak_against_id) {
                    weaknesses.push({
                        id: relationship.weak_against_id,
                        name: elementNamesMap[relationship.weak_against_id],
                    });
                }
            });

            return {
                id: element.id,
                name: element.name,
                strengths,
                weaknesses,
            };
        });

        return success(formattedElements);
    } catch (error) {
        return ServerError(error.message);
    }
};


// const updateElementRelationships = async (elementId, strengths, weaknesses) => {
//     try {
//         // Fetch the element to ensure it exists
//         const element = await ElementsModel.findByPk(elementId);
//         if (!element) {
//             return NotFoundError('Element not found');
//         }

//         const strengthId = strengths[0];
//         const weaknessId = weaknesses[0];

//         const strengthIdExist = await ElementsModel.findByPk(strengthId);
//         const weaknessIdExist = await ElementsModel.findByPk(weaknessId);

//         if (!strengthIdExist) {
//             return NotFoundError('Strength element not found');
//         }

//         if (!weaknessIdExist) {
//             return NotFoundError('Weakness element not found');
//         }

//         // Add new strengths
//         if (Array.isArray(strengths)) {
//             if (strengths.length > 1) {
//                 return BadRequestError('An element can have only one strength');
//             }
//         }

//         if (Array.isArray(weaknesses)) {
//             if (weaknesses.length > 1) {
//                 return BadRequestError('An element can have only one weakness');
//             }
//         }

//         // Remove existing relationships
//         await ElementRelationshipsModel.destroy({ where: { element_id: elementId } });

//         // Create new relationships
//         await ElementRelationshipsModel.create({
//             element_id: elementId,
//             strong_against_id: strengthId,
//             weak_against_id: weaknessId,
//         });

//         const response = {
//             id: parseInt(elementId),
//             name: element.name,
//             strengths: {
//                 id: strengthId,
//                 name: strengthId ? (await ElementsModel.findByPk(strengthId)).name : null,
//             },
//             weaknesses: {
//                 id: weaknessId,
//                 name: weaknessId ? (await ElementsModel.findByPk(weaknessId)).name : null,
//             },
//         };

//         return success(response);
//     } catch (error) {
//         return ServerError(error.message);
//     }
// };


const getAllAttributes = async () => {
    const attributes = await AttributesModel.findAll({});
    return success(attributes);
};

const getMaxLevel = async () => {
    const maxLevel = await LevelsModel.max("level_value");
    return success(maxLevel);
};

const updateMaxLevel = async (level) => {
    try{
        if (level < 0) {
            return BadRequestError("Level must be greater than 0");
        }
    
        const maxLevel = await LevelsModel.max("level_value");
        if (level > maxLevel) {
            for (let i = maxLevel + 1; i <= level; i++) {
                await LevelsModel.create({ level_value: i });
            }

            return success("Max level updated to " + level);
        } else {
            return BadRequestError("Level must be greater than the current max level. Current max level is " + maxLevel);
        }
    } catch (err) {
        return ServerError(err.message);
    }
};

module.exports = {
    getAllElements,
    // updateElementRelationships,
    getAllAttributes,
    getMaxLevel,
    updateMaxLevel,
};
