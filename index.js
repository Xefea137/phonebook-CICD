require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(morgan('tiny'))

morgan.token('person', (req) => {
  return JSON.stringify(req.body)
})

const morganDisplay = morgan(':method :url :status :res[content-length] - :response-time ms :person')

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(person => {
      response.json(person)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  const time = new Date()
  Person.find({})
    .then(person => {
      response.send(`Phonebook has info for ${person.length} people <br/> ${time}`)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).send({ error: 'Person not found' })
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      console.log(result)
      if (result) {
        response.status(204).end()
      } else {
        response.status(404).send({ error: 'Person not found' })
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', morganDisplay, (request, response, next) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({
      error: 'Name missing'
    })
  } else if (!body.number) {
    return response.status(400).json({
      error: 'Number missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  if (!number) {
    return response.status(400).json({
      error: 'Number missing'
    })
  }

  Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(updatePerson => {
      if (!updatePerson) {
        return response.status(404).json({ error: 'Person not found' })
      }
      response.json(updatePerson)
    })
    .catch(error => next(error))
})

app.get('/version', (req, res) => {
  res.send('3')
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'Malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})