const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure Sessions
app.use(session({
    secret: 'super-secret-key', // In production, use environment variables!
    resave: false,
    saveUninitialized: false
}));

// Connect to PostgreSQL using the connection string from docker-compose
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Initialize Database Tables
async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                has_voted BOOLEAN DEFAULT FALSE
            );
            CREATE TABLE IF NOT EXISTS votes (
                id SERIAL PRIMARY KEY,
                party VARCHAR(50) NOT NULL
            );
        `);
        console.log("Database tables initialized.");
    } catch (err) {
        console.error("Error initializing DB", err);
    }
}
initDB();

// --- ROUTES ---

// 1. Register a new user (Simplified for demo)
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
        res.status(201).send("User registered. You can now login.");
    } catch (err) {
        res.status(400).send("Username might already exist.");
    }
});

// 2. Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length > 0) {
        const user = result.rows[0];
        if (await bcrypt.compare(password, user.password)) {
            req.session.userId = user.id;
            req.session.hasVoted = user.has_voted;
            return res.send("Login successful!");
        }
    }
    res.status(401).send("Invalid credentials.");
});

// 3. Vote
app.post('/vote', async (req, res) => {
    if (!req.session.userId) return res.status(403).send("Must be logged in to vote.");
    if (req.session.hasVoted) return res.status(403).send("You have already voted!");

    const { party } = req.body;
    if (party !== 'Republican' && party !== 'Democrat') return res.status(400).send("Invalid party.");

    try {
        await pool.query('BEGIN');
        await pool.query('INSERT INTO votes (party) VALUES ($1)', [party]);
        await pool.query('UPDATE users SET has_voted = TRUE WHERE id = $1', [req.session.userId]);
        await pool.query('COMMIT');
        
        req.session.hasVoted = true;
        res.send(`Successfully voted for ${party}.`);
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).send("Voting failed.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
