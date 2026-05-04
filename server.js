const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static React files
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Session configuration
app.use(session({
    secret: 'super-secret-key', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

const mongoURI = process.env.MONGO_URI || 'mongodb://db:27017/votingApp';

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI);
        console.log("✅ Connected to MongoDB.");
    } catch (err) {
        console.error("❌ MongoDB connection failed. Retrying in 5 seconds...", err.message);
        setTimeout(connectDB, 5000);
    }
};
connectDB();

// --- MODELS ---

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    has_voted: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

const voteSchema = new mongoose.Schema({
    choice: { type: String, required: true }, // 'red' or 'blue'
    timestamp: { type: Date, default: Date.now }
});
const Vote = mongoose.model('Vote', voteSchema);


// --- ROUTES ---

// 1. Register
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User registered. You can now login." });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: "Username already exists." });
        res.status(500).json({ error: "Registration failed." });
    }
});

// 2. Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            req.session.hasVoted = user.has_voted;
            return res.json({ message: "Login successful!", hasVoted: user.has_voted }); 
        }
        res.status(401).json({ error: "Invalid credentials." });
    } catch (err) {
        res.status(500).json({ error: "Login failed." });
    }
});

// 3. Vote (The Pill Choice)
app.post('/api/vote', async (req, res) => {
    // Security Checks
    if (!req.session.userId) return res.status(403).json({ error: "Must be logged in." });
    if (req.session.hasVoted) return res.status(403).json({ error: "Already chosen a pill!" });

    const { choice } = req.body; // 'red' or 'blue'
    if (choice !== 'red' && choice !== 'blue') return res.status(400).json({ error: "Invalid choice." });

    try {
        // Record the vote
        const newVote = new Vote({ choice });
        await newVote.save();

        // Mark user as voted in DB
        await User.findByIdAndUpdate(req.session.userId, { has_voted: true });
        
        // Update session
        req.session.hasVoted = true;
        res.json({ message: `Truth accepted. You chose the ${choice} pill.` });
    } catch (err) {
        res.status(500).json({ error: "Database error during voting." });
    }
});

// 4. Status Check
app.get('/api/status', (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true, hasVoted: req.session.hasVoted });
    } else {
        res.json({ loggedIn: false });
    }
});

// Fallback to React
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
