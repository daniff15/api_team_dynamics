const baseAttributesKeys = ["HP", "DEF", "ATK", "SPEED"];
const complementars = ["XP", "AVAILABLE_XTRA_POINTS"];

const baseAttributes = {
    water: [10, 8, 9, 7],
    fire: [9, 7, 10, 8],
    earth: [8, 10, 7, 9],
    air: [7, 9, 8, 10]
};

module.exports = { baseAttributes, baseAttributesKeys, complementars };