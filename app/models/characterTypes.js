module.exports = (sequelize, DataTypes) => {
    const CharacterTypesModel = sequelize.define('character_type', {
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

    return CharacterTypesModel;
}
