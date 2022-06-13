const express = require('express')
const { Client } = require('pg')
require('dotenv').config()

const app = express()
const client = new Client(process.env.DATABASE_URL)

const port = process.env.PORT || 3000

client.connect()

app.get('/', (req, res) => {
    res.send('Hello world!')
})

app.get('/admin', async (req, res) => {
    if (req.query.pw == process.env.pw) {
        const tables = await client.query('SHOW TABLES')
        r = {
            'tables': tables['rows'].map(x => x['table_name']),
        }
        for (let i of r['tables']) {
            const all = await client.query(`SELECT * FROM ${i}`)
            r[i] = all['rows']
        }
        res.send(r)
    } else {
        res.redirect('/')
    }
})

app.post('/register', async (req, res) => {
    try {
        await client.query('INSERT INTO users (username, password, pfp, platoon) VALUES ($1, $2, $3, $4)', ['username', 'password', 'pfp', 'platoon'].map(x => req.body[x]))
        res.sendStatus(201)
    } catch {
        res.sendStatus(500)
    }
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})