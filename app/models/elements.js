module.exports = (sequelize, DataTypes) => {
    const ElementsModel = sequelize.define('element', {
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

    return ElementsModel;
};