import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

export const database = knex({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        ssl: false,
    }
});

