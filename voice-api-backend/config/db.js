import mysql from 'mysql2/promise';

// Create the shared connection block
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'shop_ivr'
});

// Export it so other files can use it
export default pool;