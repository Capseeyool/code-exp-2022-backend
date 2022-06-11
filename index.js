const express = require('express')
const { Client } = require('pg')

const app = express()
const client = new Client(process.env.DATABASE_URL)

const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('Hello world!')
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})