const express = require('express');
const mongoose = require('mongoose'); // Swapped pg for mongoose
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
    saveUninitialized: false
}));

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/votingApp';
mongoose.connect(mongoURI)
    .then(() => console.log("Connected to MongoDB."))
    .catch(err => console.error("Error connecting to MongoDB:", err));

// Define Mongoose Schemas and Models
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    has_voted: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

const voteSchema = new mongoose.Schema({
    party: { type: String, required: true }
});
const Vote = mongoose.model('Vote', voteSchema);


// --- ROUTES ---

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create and save the new user
        const newUser = new User({ 
            username, 
            password: hashedPassword 
        });
        await newUser.save();
        
        res.status(201).json({ message: "User registered. You can now login." });
    } catch (err) {
        // MongoDB throws code 11000 for duplicate unique keys
        if (err.code === 11000) {
            res.status(400).json({ error: "Username might already exist." });
        } else {
            res.status(500).json({ error: "Server error during registration." });
        }
    }
});


app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find user by username
        const user = await User.findOne({ username });
        
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id; // MongoDB uses _id instead of id
            req.session.hasVoted = user.has_voted;
            return res.json({ message: "Login successful!", hasVoted: user.has_voted }); 
        }
        
        res.status(401).json({ error: "Invalid credentials." });
    } catch (err) {
        res.status(500).json({ error: "Server error during login." });
    }
});


app.post('/api/vote', async (req, res) => {
    if (!req.session.userId) return res.status(403).json({ error: "Must be logged in to vote." });
    if (req.session.hasVoted) return res.status(403).json({ error: "You have already voted!" });

    const { party } = req.body;
    if (party !== 'Republican' && party !== 'Democrat') return res.status(400).json({ error: "Invalid party." });

    try {
        // 1. Record the vote
        const newVote = new Vote({ party });
        await newVote.save();

        // 2. Mark the user as having voted
        await User.findByIdAndUpdate(req.session.userId, { has_voted: true });
        
        req.session.hasVoted = true;
        res.json({ message: `Successfully voted for ${party}.` });
    } catch (err) {
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

// Fallback to serve the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
