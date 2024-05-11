module.exports = (sequelize, DataTypes) => {
    const LevelsModel = sequelize.define('level', {
        level_value: {
            type: DataTypes.INTEGER,
            primaryKey: true
        }
    }, {
        timestamps: false
    });

    return LevelsModel;
};
