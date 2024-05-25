module.exports = (sequelize, DataTypes) => {
    const BattlesModel = sequelize.define('battle', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        team_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        opponent_team_id: {
            type: DataTypes.INTEGER
        },
        boss_id: {
            type: DataTypes.INTEGER
        },
        battle_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        winner_id: {
            type: DataTypes.INTEGER
        }
    }, {
        timestamps: false
    });

    BattlesModel.associate = (models) => {
        BattlesModel.belongsTo(models.TeamsModel, { foreignKey: 'team_id' });
        BattlesModel.belongsTo(models.TeamsModel, { foreignKey: 'opponent_team_id', as: 'opponent_team' });
        BattlesModel.belongsTo(models.BossesModel, { foreignKey: 'boss_id', as: 'boss' });
    }

    return BattlesModel;
}
