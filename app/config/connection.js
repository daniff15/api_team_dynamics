const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: 'root',
    database: 'team_dynamics',
});

module.exports = pool;
