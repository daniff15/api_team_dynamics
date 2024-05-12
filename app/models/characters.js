module.exports = (sequelize, DataTypes) => {
    const CharactersModel = sequelize.define('character', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        character_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        level_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        xp: {
            type: DataTypes.INTEGER
        },
        total_xp: {
            type: DataTypes.INTEGER
        },
        att_xtra_points: {
            type: DataTypes.INTEGER
        }
    }, {
        timestamps: false
    });

    CharactersModel.associate = (models) => {
        CharactersModel.belongsTo(models.LevelsModel, { foreignKey: 'level_id' });
        CharactersModel.belongsTo(models.CharacterTypesModel, { foreignKey: 'character_type_id' });
        CharactersModel.hasMany(models.CharacterLevelAttributesModel, { foreignKey: 'character_id' });
        CharactersModel.hasMany(models.CharacterElementsModel, { foreignKey: 'character_id' });
    }

    return CharactersModel;
}