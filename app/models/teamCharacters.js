module.exports = (sequelize, DataTypes) => {
    const TeamCharactersModel = sequelize.define('team_character', {
        team_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        character_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        }
    }, {
        timestamps: false
    });

    TeamCharactersModel.associate = (models) => {
        TeamCharactersModel.belongsTo(models.TeamsModel, { foreignKey: 'team_id' });
        TeamCharactersModel.belongsTo(models.CharactersModel, { foreignKey: 'character_id' });
    }

    return TeamCharactersModel;
}
