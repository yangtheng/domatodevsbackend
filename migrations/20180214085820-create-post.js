'use strict'
module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('Posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      BlogId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Blogs'
          }
        },
        key: 'id'
      },
      ParentPostId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Posts'
          }
        },
        key: 'id'
      },
      LocationId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Locations'
          }
        },
        key: 'id'
      },
      loadSequence: {
        type: Sequelize.INTEGER
      },
      textContent: {
        type: Sequelize.TEXT
      },
      title: {
        type: Sequelize.STRING
      },
      contentOnly: {
        type: Sequelize.BOOLEAN
      },
      description: {
        type: Sequelize.STRING
      },
      start: {
        type: Sequelize.BOOLEAN
      },
      startDay: {
        type: Sequelize.INTEGER
      },
      endDay: {
        type: Sequelize.INTEGER
      },
      eventType: {
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

  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable('Posts')
  }
}