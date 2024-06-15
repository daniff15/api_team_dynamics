module.exports = (sequelize, DataTypes) => {
    const GamesModel = sequelize.define('game', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
    }, 
    {
        timestamps: false
    });

    return GamesModel;
};
