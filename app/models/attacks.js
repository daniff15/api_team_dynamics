module.exports = (sequelize, DataTypes) => {
    const AttacksModel = sequelize.define('attack', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        battle_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        attacker_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        defender_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        damage: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        attack_time: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, {
        timestamps: false
    });

    AttacksModel.associate = (models) => {
        AttacksModel.belongsTo(models.BattlesModel, { foreignKey: 'battle_id' });
        AttacksModel.belongsTo(models.CharactersModel, { foreignKey: 'attacker_id', as: 'attacker' });
        AttacksModel.belongsTo(models.CharactersModel, { foreignKey: 'defender_id', as: 'defender' });
    };

    return AttacksModel;
};
