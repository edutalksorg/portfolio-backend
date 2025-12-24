const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    try {
        console.log('Connecting to database:', process.env.DB_NAME);
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log('✓ Connected to database');

        // Create admins table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS admins (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Admins table verified/created');

        // Create jobs table
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
        console.log('✓ Jobs table verified/created');

        // Create team_members table
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
        console.log('✓ Team members table verified/created');

        // Hash password for admin user
        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        // Insert admin user
        await connection.execute(
            `INSERT INTO admins (email, password, name) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE email=email`,
            ['admin@gmail.com', hashedPassword, 'Admin User']
        );
        console.log('✓ Admin user ready (admin@gmail.com / Admin@123)');

        const [tables] = await connection.execute('SHOW TABLES');
        console.log('Final Tables:', tables);

        await connection.end();
        console.log('\n✅ Database setup completed successfully!');
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        process.exit(1);
    }
}

setupDatabase();
