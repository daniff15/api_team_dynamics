module.exports = (sequelize, DataTypes) => {
    const TeamPlayersModel = sequelize.define('team_player', {
        team_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        player_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        }
    }, {
        timestamps: false
    });

    TeamPlayersModel.associate = (models) => {
        TeamPlayersModel.belongsTo(models.TeamsModel, { foreignKey: 'team_id' });
        TeamPlayersModel.belongsTo(models.PlayersModel, { foreignKey: 'player_id' });
    }

    return TeamPlayersModel;
}
