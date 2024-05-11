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

    ElementsModel.associate = (models) => {
        ElementsModel.hasMany(models.ElementRelationshipsModel, { foreignKey: 'element_id'});
        ElementsModel.hasMany(models.ElementRelationshipsModel, { foreignKey: 'strong_against_id', as: 'weaknesses' });
        ElementsModel.hasMany(models.ElementRelationshipsModel, { foreignKey: 'weak_against_id', as: 'strengths' });
    };

    return ElementsModel;
};
