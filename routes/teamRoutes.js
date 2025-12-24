const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { verifyToken } = require('./adminRoutes');
require('dotenv').config();

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

// GET /api/team - Fetch all team members
router.get('/', async (req, res) => {
    try {
        const [members] = await pool.execute('SELECT * FROM team_members ORDER BY created_at DESC');
        res.status(200).json({
            success: true,
            data: members
        });
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch team members'
        });
    }
});

// POST /api/team - Add a new team member (Protected)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { name, role, image, description } = req.body;

        if (!name || !role) {
            return res.status(400).json({
                success: false,
                message: 'Name and role are required'
            });
        }

        const [result] = await pool.execute(
            'INSERT INTO team_members (name, role, image, description) VALUES (?, ?, ?, ?)',
            [name, role, image || null, description || null]
        );

        res.status(201).json({
            success: true,
            message: 'Team member added successfully',
            data: {
                id: result.insertId,
                name,
                role,
                image,
                description
            }
        });
    } catch (error) {
        console.error('Error adding team member:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add team member'
        });
    }
});

// DELETE /api/team/:id - Remove a team member (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.execute('DELETE FROM team_members WHERE id = ?', [id]);
        res.status(200).json({
            success: true,
            message: 'Team member removed successfully'
        });
    } catch (error) {
        console.error('Error deleting team member:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete team member'
        });
    }
});

// PUT /api/team/:id - Update a team member (Protected)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, image, description } = req.body;

        if (!name || !role) {
            return res.status(400).json({
                success: false,
                message: 'Name and role are required'
            });
        }

        await pool.execute(
            'UPDATE team_members SET name = ?, role = ?, image = ?, description = ? WHERE id = ?',
            [name, role, image || null, description || null, id]
        );

        res.status(200).json({
            success: true,
            message: 'Team member updated successfully',
            data: { id, name, role, image, description }
        });
    } catch (error) {
        console.error('Error updating team member:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update team member'
        });
    }
});

module.exports = router;
