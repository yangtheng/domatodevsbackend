'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('MediaPosts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      MediumId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Media'
          },
          key: 'id'
        }
      },
      PostId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Posts'
          },
          key: 'id'
        }
      },
      loadSequence: {
        type: Sequelize.INTEGER
      },
      caption: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('MediaPosts')
  }
}
