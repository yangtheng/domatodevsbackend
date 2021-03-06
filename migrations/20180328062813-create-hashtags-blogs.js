'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('HashtagsBlogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      HashtagId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Hashtags'
          },
          key: 'id'
        }
      },
      BlogId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Blogs'
          },
          key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('HashtagsBlogs')
  }
}
