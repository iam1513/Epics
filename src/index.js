const express = require("express")
const ServerConfig = require('./config/server-config')
const { createUserTable } = require("./db/model")
const app = express()

createUserTable().then(() => {
    console.log("Table created");
    app.listen(ServerConfig.PORT, () => {
        console.log(`Server is running on port ${ServerConfig.PORT}`);
    });
});