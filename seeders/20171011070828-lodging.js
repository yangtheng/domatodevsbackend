'use strict'
const casual = require('casual')
const faker = require('faker')

module.exports = {
  up: function (queryInterface, Sequelize) {
    var seedArr = []
    for (var i = 1; i <= 50; i++) {
      seedArr.push({
        id: i,
        ItineraryId: i,
        LocationId: i,
        name: `Lodging ${i}`,
        notes: casual.sentences(3),
        startTime: casual.time(),
        endTime: casual.time(),
        cost: Math.floor(Math.random() * 100) + 1,
        currency: casual.currency_code,
        bookingStatus: false,
        bookedThrough: faker.internet.url(),
        attachment: faker.internet.avatar(),
        roomType: 'Double',
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
    return queryInterface.bulkInsert('Lodgings', seedArr, {})
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Lodgings', null, {})
  }
}
