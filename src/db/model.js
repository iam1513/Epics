const { neon } = require("@neondatabase/serverless");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();
const sql = neon(process.env.DB_URL);
async function createUserTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS dustbin (
        user_id SERIAL PRIMARY KEY,
        phone_number VARCHAR(15) NOT NULL,
        block VARCHAR(10),
        floor INTEGER,
        address VARCHAR(255) NOT NULL,
        latitude NUMERIC(10, 6),
        longitude NUMERIC(10, 6),
        weight NUMERIC(5, 2),
        height_threshold NUMERIC(5, 2),
        filled_status BOOLEAN DEFAULT FALSE
      );
    `;

  } catch (error) {
    console.error("Error creating table:", error);
  }
}

async function updateFilledStatus() {
  try {
    const { rowCount } = await sql`
  UPDATE dustbin
  SET filled_status = TRUE
  WHERE height_threshold >= 80.00 AND filled_status = FALSE;
`;

    if (rowCount > 0) {
      console.log(`Updated ${rowCount} bins as filled.`);
    }
  } catch (error) {
    console.error("Error updating filled status:", error);
  }
}

async function checkAndSendAlerts() {
  try {
    const bins = await sql`SELECT * FROM dustbin WHERE filled_status = TRUE`;

    for (const bin of bins) {
      const { user_id, phone_number, address, latitude, longitude, weight, height_threshold } = bin;

      try {
        const response = await axios.post(
          "https://ucnhoyjc08.execute-api.ap-south-1.amazonaws.com/",
          { "phone": phone_number, "weight": weight, "fill_level": height_threshold }
        );

        if (response.status === 200) {
          await sql`UPDATE dustbin SET filled_status = FALSE WHERE user_id = ${user_id}`;
          console.log(`Alert sent for Bin at ${address} (Weight: ${weight}kg)`);
        }
      } catch (error) {
        console.error(`API request failed for Bin at ${address}:`, error.message);
      }
    }
  } catch (err) {
    console.error(" Database query error:", err);
  }
}

async function startMonitoring() {
  await createUserTable();

  setInterval(async () => {
    await updateFilledStatus();
    await checkAndSendAlerts();
  }, 10000);
}

startMonitoring();

module.exports = { createUserTable, startMonitoring };
