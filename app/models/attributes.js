
module.exports = (sequelize, DataTypes) => {
    const AttributesModel = sequelize.define('attribute', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false
    });

    return AttributesModel;
}