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

// GET /api/jobs - Get all active jobs (public)
router.get('/', async (req, res) => {
    try {
        const [jobs] = await pool.execute(
            'SELECT * FROM jobs WHERE is_active = TRUE ORDER BY created_at DESC'
        );

        res.status(200).json({
            success: true,
            jobs
        });
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch jobs'
        });
    }
});

// GET /api/jobs/:id - Get single job (public)
router.get('/:id', async (req, res) => {
    try {
        const [jobs] = await pool.execute(
            'SELECT * FROM jobs WHERE id = ? AND is_active = TRUE',
            [req.params.id]
        );

        if (jobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        res.status(200).json({
            success: true,
            job: jobs[0]
        });
    } catch (error) {
        console.error('Get job error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch job'
        });
    }
});

// POST /api/jobs - Create new job (admin only)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title, department, location, type, description } = req.body;

        if (!title || !department || !location || !description) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const [result] = await pool.execute(
            'INSERT INTO jobs (title, department, location, type, description) VALUES (?, ?, ?, ?, ?)',
            [title, department, location, type || 'Full-time', description]
        );

        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            jobId: result.insertId
        });
    } catch (error) {
        console.error('Create job error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create job'
        });
    }
});

// PUT /api/jobs/:id - Update job (admin only)
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { title, department, location, type, description, is_active } = req.body;

        const [result] = await pool.execute(
            'UPDATE jobs SET title = ?, department = ?, location = ?, type = ?, description = ?, is_active = ? WHERE id = ?',
            [title, department, location, type, description, is_active !== undefined ? is_active : true, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Job updated successfully'
        });
    } catch (error) {
        console.error('Update job error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update job'
        });
    }
});

// DELETE /api/jobs/:id - Delete job (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const [result] = await pool.execute(
            'DELETE FROM jobs WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        console.error('Delete job error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete job'
        });
    }
});

// GET /api/jobs/admin/all - Get all jobs including inactive (admin only)
router.get('/admin/all', verifyToken, async (req, res) => {
    try {
        const [jobs] = await pool.execute(
            'SELECT * FROM jobs ORDER BY created_at DESC'
        );

        res.status(200).json({
            success: true,
            jobs
        });
    } catch (error) {
        console.error('Get all jobs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch jobs'
        });
    }
});

module.exports = router;
