require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const jwt = require('jsonwebtoken')

const schema = require('./graphql/schemas/mergedSchema')

const { graphqlExpress, graphiqlExpress } = require('apollo-server-express')

const app = express()

const _ = require('lodash')

let whitelist = ['http://localhost:3000', 'https://domatodevs.herokuapp.com']

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not in list of whitelisted origins'))
    }
  }
}

app.use(cors(corsOptions))

// app.use(cors())

app.use(bodyParser.json())

function insertNewlines (certificate) {
  for (var i = 64; i < certificate.length; i += 65) {
    certificate = certificate.slice(0, i) + '\n' + certificate.slice(i)
  }
  return certificate
}

function addBoundaries (certificate) {
  return '-----BEGIN CERTIFICATE-----\n' + certificate + '\n-----END CERTIFICATE-----'
}

function getPEM (certificate) {
  certificate = insertNewlines(certificate)
  certificate = addBoundaries(certificate)
  return certificate
}

function verifyAuth0Token (req, res, next) {
  // console.log('headers', req.headers)
  const jwks = require('./auth0jwks.json')
  // console.log('jwks', jwks)

  // obtain X509 certificate chain from jwk obj
  var key = jwks.keys[0]
  var certificate = key.x5c[0]
  var pem = getPEM(certificate)
  // console.log('pem', pem)

  var accessToken = _.get(req, 'headers.authorization', '').substring(7)
  // var accessToken = req.headers.authorization.substring(7)
  jwt.verify(accessToken, pem, {
    // audience: 'http://localhost:3001',
    audience: 'https://domatodevsbackend.herokuapp.com/graphql',
    issuer: 'https://domatodevs.auth0.com/',
    ignoreExpiration: false,
    algorithms: ['RS256']}, function (err, payload) {
    if (err) {
      console.log('ACCESS TOKEN MISSING OR NOT VALID', err)
    }
    if (payload) {
      // console.log('payload', payload)
      // attach unique userid to request and pass it on to resolvers.
      req.user = payload.sub
    }
  })
  next()
}

app.use('/graphql', verifyAuth0Token)

// PASS AUTH0 USERID INTO CONTEXT
app.use('/graphql', graphqlExpress(req => ({
  schema: schema,
  context: {
    user: req.user
  }
})))

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql'
}))

const port = process.env.PORT || 3001
app.listen(port, function () {
  console.log(`Graphql is running on port ${port}`)
})
