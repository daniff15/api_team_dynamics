'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('character_level_attributes', {
      character_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'characters',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      level_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'levels',
          key: 'level'
        },
        onDelete: 'CASCADE'
      },
      attribute_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'attributes',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      value: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('character_level_attributes');
  }
};
