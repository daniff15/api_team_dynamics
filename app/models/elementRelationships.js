module.exports = (sequelize, DataTypes) => {
    const ElementRelationshipsModel = sequelize.define('element_relationship', {
        element_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        strong_against_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        weak_against_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        }
    }, {
        timestamps: false
    });

    ElementRelationshipsModel.associate = (models) => {
        ElementRelationshipsModel.belongsTo(models.ElementsModel, { foreignKey: 'element_id' });
        ElementRelationshipsModel.belongsTo(models.ElementsModel, { foreignKey: 'strong_against_id', as: 'strong_against' });
        ElementRelationshipsModel.belongsTo(models.ElementsModel, { foreignKey: 'weak_against_id', as: 'weak_against' });
    }

    return ElementRelationshipsModel;
};