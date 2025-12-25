const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: [

        'https://edutalksacademy.in',
        'https://www.edutalksacademy.in',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
}));
app.use(express.json());

// Database connection pool (more reliable for Azure)
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Database initialization function
async function initializeDatabase() {
    const bcrypt = require('bcryptjs');

    try {
        const connection = await db.promise().getConnection();
        console.log('✅ Connected to MySQL database');

        // Create admins table if not exists
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Admins table verified/created');

        // Create jobs table if not exists
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS jobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                department VARCHAR(100) NOT NULL,
                location VARCHAR(255) NOT NULL,
                type ENUM('Full-time', 'Part-time', 'Contract') DEFAULT 'Full-time',
                description TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            )
        `);
        console.log('✅ Jobs table verified/created');

        // Create team_members table if not exists
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS team_members (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(255) NOT NULL,
                image VARCHAR(255),
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Team members table verified/created');

        // Check if admin user exists
        const [existingAdmins] = await connection.execute(
            'SELECT * FROM admins WHERE email = ?',
            ['admin@gmail.com']
        );

        if (existingAdmins.length === 0) {
            // Hash password and create default admin
            const hashedPassword = await bcrypt.hash('Admin@123', 10);
            await connection.execute(
                'INSERT INTO admins (email, password, name) VALUES (?, ?, ?)',
                ['admin@gmail.com', hashedPassword, 'Admin User']
            );
            console.log('✅ Default admin user created (admin@gmail.com / Admin@123)');
        } else {
            console.log('✅ Admin user already exists');
        }

        connection.release();
        console.log('🎉 Database initialization completed successfully!\n');
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        console.error('Connection details:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME,
            hasPassword: !!process.env.DB_PASS
        });
    }
}

// Initialize database on startup
initializeDatabase();

// Routes
const contactRoutes = require('./routes/contactRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const adminRoutes = require('./routes/adminRoutes');
const jobRoutes = require('./routes/jobRoutes');

app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/jobs', jobRoutes);


// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        // Test database connection
        await new Promise((resolve, reject) => {
            db.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                } else {
                    connection.release();
                    resolve();
                }
            });
        });

        res.status(200).json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString(),
            env: {
                hasDbHost: !!process.env.DB_HOST,
                hasDbUser: !!process.env.DB_USER,
                hasDbPass: !!process.env.DB_PASS,
                hasDbName: !!process.env.DB_NAME,
                hasJwtSecret: !!process.env.JWT_SECRET,
                dbHost: process.env.DB_HOST || 'not set'
            }
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
            errorCode: error.code,
            env: {
                hasDbHost: !!process.env.DB_HOST,
                hasDbUser: !!process.env.DB_USER,
                hasDbPass: !!process.env.DB_PASS,
                hasDbName: !!process.env.DB_NAME,
                dbHost: process.env.DB_HOST || 'not set'
            }
        });
    }
});

// Basic Route
app.get('/', (req, res) => {
    res.send('Edutalks Portfolio API is running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});