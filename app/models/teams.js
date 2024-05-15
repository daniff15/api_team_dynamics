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
        community_id: {
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
        }
    }, 
    {
        timestamps: false
    });

    TeamsModel.associate = (models) => {
        TeamsModel.belongsTo(models.CommunitiesModel, {
            foreignKey: 'community_id'
        });
        TeamsModel.hasMany(models.TeamCharactersModel, { foreignKey: 'team_id' });
    };

    return TeamsModel;
}
