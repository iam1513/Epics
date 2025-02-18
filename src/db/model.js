
const { neon } = require("@neondatabase/serverless");
const dotenv = require("dotenv");
dotenv.config();
const sql = neon(process.env.DB_URL);
async function createUserTable() {
    await sql`
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      phone_number VARCHAR(15) NOT NULL,
      block VARCHAR(10),
      floor INTEGER,
      address VARCHAR(255) NOT NULL,
      latitude NUMERIC(10, 6),
      longitude NUMERIC(10, 6),
      weight NUMERIC(5, 2),
      height_threshold NUMERIC(5, 2)
    );
  `;
}

module.exports = { createUserTable };

