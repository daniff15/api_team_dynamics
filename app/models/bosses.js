module.exports = (sequelize, DataTypes) => {
    const BossesModel = sequelize.define('boss', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        before_defeat_phrase: {
            type: DataTypes.STRING,
            allowNull: true
        },
        after_defeat_phrase: {
            type: DataTypes.STRING,
            allowNull: true
        },
    }, {
        timestamps: false
    });

    BossesModel.associate = (models) => {
        BossesModel.belongsTo(models.CharactersModel, { foreignKey: 'id' });
    }

    return BossesModel;
}