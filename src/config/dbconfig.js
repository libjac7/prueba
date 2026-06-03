import dotenv from 'dotenv'
dotenv.config();

import mysql from 'mysql2';

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log('Conexión exitosa');
});

export default db;





