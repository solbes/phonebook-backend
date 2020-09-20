require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const { response } = require('express')
const app = express()

morgan.token('postdata', function (req, res) { 
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  } else {
    return ''
  }
 })

app.use(cors())
app.use(express.static('build'))
app.use(express.json()) 
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postdata'))

let persons = [
  { name: 'Arto Hellas', number: '040-123456', id: 1 },
  { name: 'Ada Lovelace', number: '39-44-5323523', id: 2 },
  { name: 'Dan Abramov', number: '12-43-234345', id: 3 },
  { name: 'Mary Poppendieck', number: '39-23-6423122', id: 4 },
  { name: 'Dirl', number: '3', id: 5 }
]

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(people => {
    res.json(people)
  })
})

app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p>
            <p>${new Date()}</p>`)
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(person => {
    res.json(person)
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  //const id = Number(req.params.id)
  //persons = persons.filter(person => person.id !== id)
  //res.status(204).end()
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res) => {

  const body = req.body

  if ( !body.name ) {
    return res.status(400).json({ 
      error: 'name missing' 
    })
  }
  if ( !body.number ) {
    return res.status(400).json({ 
      error: 'number missing' 
    })
  }
  // check if name already exists
  if (persons.map(p => p.name).includes(body.name)) {
    return res.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    persons = persons.concat(savedPerson)
    res.json(savedPerson)
  })
})

// unknown endpoint handling
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

// error handling
const errorHandler = (error, request, response, next) => {
  console.log('IN ERROR HANDLER')
  console.log(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})