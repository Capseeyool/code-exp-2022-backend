const express = require('express')
const { Client } = require('pg')
require('dotenv').config()

const app = express()
app.use(express.json())

const client = new Client(process.env.DATABASE_URL)
client.connect()

const port = process.env.PORT || 3000

app.get('/', (req, res) => {
    res.send('Hello world!')
})

app.get('/admin', async (req, res) => {
    if (req.query.pw === process.env.pw) {
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

app.post('/login', async (req, res) => {
    if (req.body.username && req.body.password) {
        const password = await client.query('SELECT password FROM users WHERE username = $1', [req.body.username])
        if (password) {
            if (req.body.password === password.rows[0].password) {
                const user = await client.query('SELECT * FROM users WHERE username = $1', [req.body.username])
                res.send(user.rows[0])
            } else {
                res.sendStatus(401)
            }
        } else {
            res.sendStatus(400)
        }
    }
})

app.post('/register', async (req, res) => {
    try {
        await client.query('INSERT INTO users (username, password, pfp, platoon) VALUES ($1, $2, $3, $4)', ['username', 'password', 'pfp', 'platoon'].map(x => req.body[x]))
        res.sendStatus(201)
    } catch (e) {
        res.send(e)
    }
})

app.post('/events', async (req, res) => {
    if (req.query.username && req.query.password) {
        const password = await client.query('SELECT password FROM users WHERE username = $1', [req.query.username])
        if (req.query.password === password.rows[0].password) {
            const events = await client.query('SELECT * FROM events WHERE user_username = $1', [req.query.username])
            res.send(events.rows)
        } else {
            res.sendStatus(401)
        }
    } else {
        res.sendStatus(400)
    }
})

app.post('/events', async (req, res) => {
    if (req.body.username && req.body.password) {
        const password = await client.query('SELECT password FROM users WHERE username = $1', [req.body.username])
        if (req.body.password === password.rows[0].password) {
            try {
                await client.query('INSERT INTO events VALUES($1, $2, $3, $4, $5, $6, $7)',
                [
                    req.body.username,
                    ...['title', 'description', 'backgroundColor', 'borderColor', 'startDate', 'endDate'].map(x => req.body.body[x])
                ])
                res.sendStatus(201)
            } catch (e) {
                res.send(e)
            }
        }
    }
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})