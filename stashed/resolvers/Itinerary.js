// events (itinerary) {
//   // console.log('itinerary', itinerary)
//   var ItineraryId = itinerary.id
//
//   var models = ['Activity', 'Food', 'Lodging', 'FlightBooking', 'LandTransport', 'SeaTransport', 'Train']
//   var eventModelPromises = []
//
//   models.forEach(model => {
//     var arrModel = []
//     var eventModel = db[model].findAll({where: {ItineraryId: ItineraryId}})
//       .then(foundRows => {
//         if (model === 'Activity' || model === 'Food') {
//           foundRows.forEach(e => {
//             // activity and food have utcOffset in case no location
//             var rowObj = {day: e.startDay, type: model, modelId: e.id, loadSequence: e.loadSequence, [model]: e, time: e.startTime, utcOffset: e.utcOffset, timeUtcZero: e.startTime - e.utcOffset * 60}
//             arrModel.push(rowObj)
//           })
//           return Promise.all(arrModel)
//         }
//         if (model === 'Lodging') {
//           foundRows.forEach(e => {
//             var startRow = e.getLocation()
//               .then(location => {
//                 var obj = {day: e.startDay, start: true, type: model, modelId: e.id, loadSequence: e.startLoadSequence, [model]: e, time: e.startTime, utcOffset: location.utcOffset}
//                 obj.timeUtcZero = obj.time - obj.utcOffset * 60
//                 return Promise.resolve(obj)
//               })
//             var endRow = e.getLocation()
//               .then(location => {
//                 var obj = {day: e.endDay, start: false, type: model, modelId: e.id, loadSequence: e.endLoadSequence, [model]: e, time: e.endTime, utcOffset: location.utcOffset}
//                 obj.timeUtcZero = obj.time - obj.utcOffset * 60
//                 return Promise.resolve(obj)
//               })
//             arrModel.push(startRow, endRow)
//           })
//           return Promise.all(arrModel)
//         }
//         if (model === 'LandTransport') {
//           foundRows.forEach(e => {
//             var startRow = e.getLandTransportDeparture()
//               .then(departureLocation => {
//                 var obj = {day: e.startDay, start: true, type: model, modelId: e.id, loadSequence: e.startLoadSequence, [model]: e, time: e.startTime, utcOffset: departureLocation.utcOffset}
//                 obj.timeUtcZero = obj.time - obj.utcOffset * 60
//                 return Promise.resolve(obj)
//               })
//             var endRow = e.getLandTransportArrival()
//               .then(arrivalLocation => {
//                 var obj = {day: e.endDay, start: false, type: model, modelId: e.id, loadSequence: e.endLoadSequence, [model]: e, time: e.endTime, utcOffset: arrivalLocation.utcOffset}
//                 obj.timeUtcZero = obj.time - obj.utcOffset * 60
//                 return Promise.resolve(obj)
//               })
//             arrModel.push(startRow, endRow)
//           })
//           return Promise.all(arrModel)
//         }
//         if (model === 'SeaTransport') {
//           foundRows.forEach(e => {
//             var startRow = e.getSeaTransportDeparture()
//               .then(departureLocation => {
//                 var obj = {day: e.startDay, start: true, type: model, modelId: e.id, loadSequence: e.startLoadSequence, [model]: e, time: e.startTime, utcOffset: departureLocation.utcOffset}
//                 obj.timeUtcZero = obj.time - obj.utcOffset * 60
//                 return Promise.resolve(obj)
//               })
//             var endRow = e.getSeaTransportArrival()
//               .then(arrivalLocation => {
//                 var obj = {day: e.endDay, start: false, type: model, modelId: e.id, loadSequence: e.endLoadSequence, [model]: e, time: e.endTime, utcOffset: arrivalLocation.utcOffset}
//                 obj.timeUtcZero = obj.time - obj.utcOffset * 60
//                 return Promise.resolve(obj)
//               })
//             arrModel.push(startRow, endRow)
//           })
//           return Promise.all(arrModel)
//         }
//         if (model === 'Train') {
//           foundRows.forEach(e => {
//             var startRow = e.getTrainDeparture()
//               .then(departureLocation => {
//                 var obj = {day: e.startDay, start: true, type: model, modelId: e.id, loadSequence: e.startLoadSequence, [model]: e, time: e.startTime, utcOffset: departureLocation.utcOffset}
//                 obj.timeUtcZero = obj.time - obj.utcOffset * 60
//                 return Promise.resolve(obj)
//               })
//             var endRow = e.getTrainArrival()
//               .then(arrivalLocation => {
//                 var obj = {day: e.endDay, start: false, type: model, modelId: e.id, loadSequence: e.endLoadSequence, [model]: e, time: e.endTime, utcOffset: arrivalLocation.utcOffset}
//                 obj.timeUtcZero = obj.time - obj.utcOffset * 60
//                 return Promise.resolve(obj)
//               })
//             arrModel.push(startRow, endRow)
//           })
//           return Promise.all(arrModel)
//         }
//         // FLIGHTBOOKING AND FLIGHTINSTANCE ---> 2 EVENT ROWS
//         if (model === 'FlightBooking') {
//           // foundRows are FlightBooking rows here
//           var arrBookingPromises = []
//           foundRows.forEach(booking => {
//             var eventRowsForThisBooking = booking.getFlightInstances()
//             .then(instances => {
//               var eventRows = []
//
//               instances.forEach(instance => {
//                 var eventRow = {}
//                 eventRow.instance = instance
//                 eventRow.booking = booking
//                 eventRows.push(eventRow)
//               })
//               return eventRows
//             })
//             arrBookingPromises.push(eventRowsForThisBooking)
//           })
//           return Promise.all(arrBookingPromises)
//           .then(values => {
//             var flattened = values.reduce(function (a, b) {
//               return a.concat(b)
//             }, [])
//             // console.log('FLATTENED', flattened)
//             return flattened
//           })
//           .then(flattened => {
//             // modelId refers to flightBooking id
//             flattened.forEach(eventRow => {
//               var startRow = eventRow.instance.getFlightDeparture()
//                 .then(departureLocation => {
//                   var obj = {day: eventRow.instance.startDay, type: 'Flight', start: true, modelId: eventRow.instance.FlightBookingId, loadSequence: eventRow.instance.startLoadSequence, time: eventRow.instance.startTime, utcOffset: departureLocation.utcOffset, Flight: {FlightInstance: eventRow.instance, FlightBooking: eventRow.booking}}
//                   obj.timeUtcZero = obj.time - obj.utcOffset * 60
//                   return Promise.resolve(obj)
//                 })
//               var endRow = eventRow.instance.getFlightArrival()
//                 .then(arrivalLocation => {
//                   var obj = {day: eventRow.instance.endDay, type: 'Flight', start: false, modelId: eventRow.instance.FlightBookingId, loadSequence: eventRow.instance.endLoadSequence, time: eventRow.instance.endTime, utcOffset: arrivalLocation.utcOffset, Flight: {FlightInstance: eventRow.instance, FlightBooking: eventRow.booking}}
//                   obj.timeUtcZero = obj.time - obj.utcOffset * 60
//                   return Promise.resolve(obj)
//                 })
//               arrModel.push(startRow, endRow)
//             })
//             // return arrModel
//             return Promise.all(arrModel)
//               .then(values => {
//                 // console.log('FLIGHTS ROWS', values)
//                 return values
//               })
//           })
//         }
//       })
//     eventModelPromises.push(eventModel) // each event model returns promise(arr)
//   })
//
//   return Promise.all(eventModelPromises)
//     .then(values => {
//       var events = values.reduce(function (a, b) {
//         return a.concat(b)
//       }, [])
//       var sorted = events.sort(function (a, b) {
//         return a.day - b.day || a.loadSequence - b.loadSequence
//       })
//       // console.log('sorted', sorted)
//       return sorted
//     })
// }