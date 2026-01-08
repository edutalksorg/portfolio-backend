const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateSchema() {
    console.log('🔄 Starting schema update...');

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });

        console.log('✅ Connected to database');

        // Alter team_members table to change image column type to LONGTEXT
        await connection.execute('ALTER TABLE team_members MODIFY COLUMN image LONGTEXT');
        console.log('✅ Altered team_members table: image column changed to LONGTEXT');

        await connection.end();
        console.log('🎉 Schema update completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Schema update failed:', error);
        process.exit(1);
    }
}

updateSchema();
