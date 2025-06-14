// Simple Express backend for HealthCare Plus
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'supersecretkey';

app.use(cors());
app.use(bodyParser.json());

// In-memory user and data storage (for demo only)
const users = [];
const medicalData = {};

// Contact form endpoint
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    // Here you would normally store the message or send an email
    console.log('Contact form submission:', { name, email, message });
    res.json({ success: true });
});

// Signup endpoint
app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Email already registered.' });
    }
    users.push({ name, email, password });
    res.json({ success: true });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
});

// Auth middleware
function auth(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided.' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token.' });
    }
}

// Save medical data
app.post('/api/medical', auth, (req, res) => {
    const { medicalData: data } = req.body;
    if (!data) return res.status(400).json({ error: 'No data provided.' });
    medicalData[req.user.email] = data;
    res.json({ success: true });
});

// Get medical data
app.get('/api/medical', auth, (req, res) => {
    res.json({ medicalData: medicalData[req.user.email] || '' });
});

// AI Chat endpoint (placeholder)
app.post('/api/ai-chat', auth, (req, res) => {
    const { message } = req.body;
    // Placeholder: echo with a health tip
    res.json({ reply: `You asked: "${message}". (AI: Remember to stay hydrated and consult a doctor for serious concerns!)` });
});

// Example endpoint for services (optional, for future expansion)
app.get('/api/services', (req, res) => {
    res.json([
        { id: 1, name: 'General Consultation', description: 'Expert advice and diagnosis for all your health concerns.' },
        { id: 2, name: 'Cardiology', description: 'Advanced heart care and diagnostics by specialists.' },
        { id: 3, name: 'Vaccination', description: 'Immunization services for children and adults.' },
        { id: 4, name: 'Emergency Care', description: '24/7 emergency services for urgent medical needs.' }
    ]);
});

app.listen(PORT, () => {
    console.log(`HealthCare Plus backend running at http://localhost:${PORT}`);
});
