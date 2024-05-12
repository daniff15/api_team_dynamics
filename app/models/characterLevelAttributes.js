module.exports = (sequelize, DataTypes) => {
    const CharacterLevelAttributesModel = sequelize.define('character_level_attribute', {
        character_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        level_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        attribute_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        value: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        timestamps: false
    });

    CharacterLevelAttributesModel.associate = (models) => {
        CharacterLevelAttributesModel.belongsTo(models.CharactersModel, { foreignKey: 'character_id' });
        CharacterLevelAttributesModel.belongsTo(models.LevelsModel, { foreignKey: 'level_id' });
        CharacterLevelAttributesModel.belongsTo(models.AttributesModel, { foreignKey: 'attribute_id' });
    }

    return CharacterLevelAttributesModel;
};