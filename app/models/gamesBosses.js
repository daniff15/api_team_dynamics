module.exports = (sequelize, DataTypes) => {
    const GameBossesModel = sequelize.define('games_boss', {
        game_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        boss_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        }
    }, {
        timestamps: false
    });

    GameBossesModel.associate = (models) => {
        GameBossesModel.belongsTo(models.GamesModel, { foreignKey: 'game_id' });
        GameBossesModel.belongsTo(models.BossesModel, { foreignKey: 'boss_id' });
    }

    return GameBossesModel;
}
