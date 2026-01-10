const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Database connection pool (reuse from index.js if exported, but creating new instance for route simplicity or import)
// Better practice: pass db instance or use a singleton. For now, creating a local pool reference to match existing pattern if separate.
// However, looking at existing code, index.js creates the pool but doesn't export it. 
// I will assume standard practice of creating a pool here or better yet, I should check if I can modify index.js to export it.
// To keep it simple and consistent with typical express apps without substantial refactoring:
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// POST /api/registrations
router.post('/', async (req, res) => {
    const { name, phone, email, grade, state, board, course, sessionMode } = req.body;

    // Basic Validation
    if (!name || !phone || !email || !grade) {
        return res.status(400).json({ error: 'Name, phone, email, and grade are required.' });
    }

    try {
        const [result] = await db.promise().execute(
            `INSERT INTO registrations (name, phone, email, grade, state, board, course, session_mode) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, phone, email, grade, state || null, board || null, course || null, sessionMode || 'offline']
        );

        res.status(201).json({ message: 'Registration successful', id: result.insertId });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Database error. Please try again later.' });
    }
});

module.exports = router;
