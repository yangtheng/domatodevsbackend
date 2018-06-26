'use strict'
module.exports = {
  up: function (queryInterface, Sequelize) {
    var album1 = {
      UserId: 'auth0|5ab1dce98bd5067ff5786507',
      title: 'Seeded album 1',
      description: 'potato tomato domato',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    var album2 = {
      UserId: 'auth0|5ab1dce98bd5067ff5786507',
      title: 'Seeded album 2 xxxxxxxxxxxxx',
      description: 'mash potato hash potato',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    let seedArr = [album1, album2]
    return queryInterface.bulkInsert('Albums', seedArr, {})
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Albums', null, {})
  }
}
