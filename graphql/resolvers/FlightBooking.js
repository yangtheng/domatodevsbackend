const db = require('../connectors')
const findOrCreateAirportLocation = require('./helpers/findOrCreateAirportLocation')
const createAllAttachments = require('./helpers/createAllAttachments')
const deleteAttachmentsFromCloud = require('./helpers/deleteAttachmentsFromCloud')

const FlightBooking = {
  FlightBooking: {
    flightInstances (flightBooking) {
      return flightBooking.getFlightInstances()
    }
  },
  Query: {
    findFlightBooking: (__, data) => {
      return db.FlightBooking.findById(data.id)
    }
  },
  Mutation: {
    // REWRITE AND REMOVE ATTACHMENTS
    createFlightBooking: (__, data) => {
      var newFlightBooking = {}
      Object.keys(data).forEach(key => {
        if (key !== 'attachments' && key !== 'flightInstances') {
          newFlightBooking[key] = data[key]
        }
      })

      return db.FlightBooking.create(newFlightBooking)
        .then(created => {
          if (data.attachments) {
            createAllAttachments(data.attachments, 'FlightBooking', created.id)
              // check if helper returns true/false
          }
          return created.id
        })
        .then(createdId => {
          var promiseArr = []
          data.flightInstances.forEach(instance => {
            var newFlightInstance = {}
            Object.keys(instance).forEach(key => {
              newFlightInstance[key] = instance[key]
            })
            newFlightInstance.FlightBookingId = createdId

            var DepartureLocationId = findOrCreateAirportLocation(instance.departureIATA)
            var ArrivalLocationId = findOrCreateAirportLocation(instance.arrivalIATA)

            var flightInstancePromise = Promise.all([DepartureLocationId, ArrivalLocationId])
              .then(values => {
                newFlightInstance.DepartureLocationId = values[0]
                newFlightInstance.ArrivalLocationId = values[1]
                return db.FlightInstance.create(newFlightInstance)
              })
            // array of promises for each flight instance
            promiseArr.push(flightInstancePromise)
          }) // close forEach loop

          // await for all flight instances to be created before returning entire flight booking
          return Promise.all(promiseArr)
            .then(values => {
              // console.log('promisearr', values)
              return createdId
            })
        }) // close flightinstance creation
        .then(createdId => {
          return db.FlightBooking.findById(createdId)
        })
    },
    updateFlightBooking: (__, data) => {
      var updates = {}
      Object.keys(data).forEach(key => {
        if (key !== 'id' && key !== 'flightInstances' && key !== 'addAttachments' && key !== 'removeAttachments') {
          updates[key] = data[key]
        }
      })

      // update flight instances first, then update attachments, lastly update FlightBooking itself
      var flightBooking = db.FlightBooking.findById(data.id)

      return flightBooking
      .then(found => {
        var arrInstancePromises = []
        if (data.flightInstances.length) {
          data.flightInstances.forEach(instance => {
            var temp = {}
            Object.keys(instance).forEach(key => {
              if (key !== 'id') {
                temp[key] = instance[key]
              }
            })
            // optionally add locations if iata was provided
            if (data.departureIATA || data.arrivalIATA) {
              if (data.departureIATA) {
                var departure = findOrCreateAirportLocation(data.departureIATA)
              }
              if (data.arrivalIATA) {
                var arrival = findOrCreateAirportLocation(data.arrivalIATA)
              }
              var instanceUpdateObj = Promise.all([departure, arrival])
              .then(values => {
                if (values[0]) {
                  temp.DepartureLocationId = values[0]
                }
                if (values[1]) {
                  temp.ArrivalLocationId = values[1]
                }
                return temp
              })
            } else {
              instanceUpdateObj = Promise.resolve(temp)
            }
            // when instance update obj is constructed, update each instance, and set up promise arr
            var instancePromise = instanceUpdateObj
            .then(constructed => {
              return db.FlightInstance.findById(instance.id)
                .then(foundInstance => {
                  return foundInstance.update(constructed)
                })
            })

            arrInstancePromises.push(instancePromise)
          })
        }
        // await all instance updates to finish, pass found FlightBooking row to next then
        return arrInstancePromises
        .then(() => {
          return found
        })
      })
      .then(found => {
        var attachmentsPromiseArr = []
        if (data.addAttachments) {
          data.addAttachments.forEach(attachment => {
            var addAttachmentPromise = db.Attachment.create({
              FlightBookingId: data.id,
              fileName: attachment.fileName,
              fileAlias: attachment.fileAlias,
              fileSize: attachment.fileSize,
              fileType: attachment.fileType
            })
            attachmentsPromiseArr.push(addAttachmentPromise)
          })
        }
        if (data.removeAttachments) {
          data.removeAttachments.forEach(id => {
            var removeAttachmentPromise = db.Attachment.destroy({where: {
              id: id
            }})
            attachmentsPromiseArr.push(removeAttachmentPromise)
          })
        }

        // when attachment promises have all fulfilled, return found FlightBooking to next then
        return Promise.all(attachmentsPromiseArr)
        .then(() => {
          return found
        })
      })
      .then(found => {
        return found.update(updates)
      })

      // return db.FlightBooking.findById(data.id)
      //   .then(found => {
      //     var arrInstancePromises = []
      //     data.flightInstances.forEach(instance => {
      //       var updates = {}
      //       Object.keys(instance).forEach(key => {
      //         if (key !== 'id') {
      //           updates[key] = instance[key]
      //         }
      //       })
      //       // ASSUMING UPDATING FLIGHT INSTANCES PASSES IATA TO BACKEND
      //       var DepartureLocationId = findOrCreateAirportLocation(instance.departureIATA)
      //       var ArrivalLocationId = findOrCreateAirportLocation(instance.arrivalIATA)
      //
      //       var instancePromise = Promise.all([DepartureLocationId, ArrivalLocationId])
      //       .then(values => {
      //         updates.DepartureLocationId = values[0]
      //         updates.ArrivalLocationId = values[1]
      //         return updates
      //       })
      //       .then(updates => {
      //         return db.FlightInstance.findById(instance.id)
      //           .then(found => {
      //             return found.update(updates)
      //           })
      //       })
      //       arrInstancePromises.push(instancePromise)
      //     }) // close forEach instance
      //
      //     return Promise.all(arrInstancePromises)
      //       .then(returning => {
      //         console.log('returning instance promises', returning)
      //         return found
      //       })
      //   })
      //   .then(found => {
      //     return found.update(updates)
      //   })
    },
    deleteFlightBooking: (__, data) => {
      // DELETE ALL ATTACHMENTS IN FLIGHT INSTANCES FROM CLOUD
      var deleteAttachmentsPromiseArr = []
      db.FlightBooking.findById(data.id)
      .then(booking => {
        booking.getFlightInstances()
        .then(instance => {
          var deletePromise = deleteAttachmentsFromCloud('FlightInstance', instance.id)
          deleteAttachmentsPromiseArr.push(deletePromise)
        })
      })

      // await all cloud attachments to be removed, then delete flight booking
      return Promise.all(deleteAttachmentsPromiseArr)
      .then(() => {
        return db.FlightBooking.destroy({where: {id: data.id}, individualHooks: true})
      })
      .catch(err => {
        console.log(err)
      })
    }
  }
}
module.exports = FlightBooking
