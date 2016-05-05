module.exports = {
    server: {
        host: process.env.SERVER_ADDR,
        port: process.env.SERVER_PORT
    },
    database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dbname: process.env.DB_NAME
    }
};