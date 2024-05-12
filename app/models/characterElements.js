module.exports = (sequelize, DataTypes) => {
    const CharacterElementsModel = sequelize.define('character_element', {
        character_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        element_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        }
    }, {
        timestamps: false
    });

    CharacterElementsModel.associate = (models) => {
        CharacterElementsModel.belongsTo(models.CharactersModel, { foreignKey: 'character_id' });
        CharacterElementsModel.belongsTo(models.ElementsModel, { foreignKey: 'element_id' });
    }

    return CharacterElementsModel;
};
