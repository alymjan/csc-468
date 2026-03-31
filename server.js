const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'frontend/build')));


app.use(session({
    secret: 'super-secret-key', 
    resave: false,
    saveUninitialized: false
}));


const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});


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


app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
        res.status(201).json({ message: "User registered. You can now login." });
    } catch (err) {
        res.status(400).json({ error: "Username might already exist." });
    }
});


app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length > 0) {
        const user = result.rows[0];
        if (await bcrypt.compare(password, user.password)) {
            req.session.userId = user.id;
            req.session.hasVoted = user.has_voted;
            // Send back JSON with the user's vote status so React knows what page to show!
            return res.json({ message: "Login successful!", hasVoted: user.has_voted }); 
        }
    }
    res.status(401).json({ error: "Invalid credentials." });
});


app.post('/api/vote', async (req, res) => {
    if (!req.session.userId) return res.status(403).json({ error: "Must be logged in to vote." });
    if (req.session.hasVoted) return res.status(403).json({ error: "You have already voted!" });

    const { party } = req.body;
    if (party !== 'Republican' && party !== 'Democrat') return res.status(400).json({ error: "Invalid party." });

    try {
        await pool.query('BEGIN');
        await pool.query('INSERT INTO votes (party) VALUES ($1)', [party]);
        await pool.query('UPDATE users SET has_voted = TRUE WHERE id = $1', [req.session.userId]);
        await pool.query('COMMIT');
        
        req.session.hasVoted = true;
        res.json({ message: `Successfully voted for ${party}.` });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: "Voting failed." });
    }
});


app.get('/api/status', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true, hasVoted: req.session.hasVoted });
    } else {
        res.json({ loggedIn: false });
    }
});


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
