const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "db",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "appuser",
  password: process.env.DB_PASSWORD || "apppass",
  database: process.env.DB_NAME || "concesionaria_db",
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;
