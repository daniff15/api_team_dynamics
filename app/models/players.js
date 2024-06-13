module.exports = (sequelize, DataTypes) => {
    const PlayersModel = sequelize.define('player', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        xp: {
            type: DataTypes.INTEGER
        },
        total_xp: {
            type: DataTypes.INTEGER
        },
        att_xtra_points: {
            type: DataTypes.INTEGER
        },
        ext_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false
        },
    }, {
        timestamps: false
    });

    PlayersModel.associate = (models) => {
        PlayersModel.belongsTo(models.CharactersModel, { foreignKey: 'id' });
        PlayersModel.hasMany(models.TeamPlayersModel, { foreignKey: 'player_id' });
    }

    return PlayersModel;
}