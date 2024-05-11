module.exports = (sequelize, DataTypes) => {
    const CommunitiesModel = sequelize.define('community', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, 
    {
        timestamps: false
    });

    return CommunitiesModel;
};
