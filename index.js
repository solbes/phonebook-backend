const express = require('express')
const morgan = require('morgan')
const app = express()

morgan.token('postdata', function (req, res) { 
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  } else {
    return ''
  }
 })

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
  res.json(persons)
})

app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p>
            <p>${new Date()}</p>`)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)
  res.status(404).end()
})

app.post('/api/persons', (req, res) => {
  const id = Math.floor(1e6*Math.random())
  const person = {...req.body, id: id}
  console.log(req.method)

  // check if name or number missing
  if ( !person.name ) {
    return res.status(400).json({ 
      error: 'name missing' 
    })
  }
  if ( !person.number ) {
    return res.status(400).json({ 
      error: 'number missing' 
    })
  }
  // check if name already exists
  if (persons.map(p => p.name).includes(person.name)) {
    return res.status(400).json({ 
      error: 'name must be unique' 
    })
  }

  persons = persons.concat(person)
  res.json(person)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})