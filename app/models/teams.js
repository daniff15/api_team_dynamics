module.exports = (sequelize, DataTypes) => {
    const TeamsModel = sequelize.define('team', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        community_id_ext: {
            type: DataTypes.STRING,
            allowNull: false
        },
        game_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        owner_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        total_xp: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        team_image_path: {
            type: DataTypes.STRING
        },
        cooldown_time: {
            type: DataTypes.DATE,
            defaultValue: null,
            allowNull: true
        }
    }, 
    {
        timestamps: false
    });

    TeamsModel.associate = (models) => {
        TeamsModel.belongsTo(models.GamesModel, {
            foreignKey: 'game_id'
        });
        TeamsModel.belongsTo(models.PlayersModel, {
            foreignKey: 'owner_id'
        });
        TeamsModel.hasMany(models.TeamPlayersModel, { foreignKey: 'team_id' });
    };

    return TeamsModel;
}
