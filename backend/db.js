const { Pool } = require('pg');

const useSsl = String(process.env.PG_SSL || '').toLowerCase() === 'true';

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: useSsl ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT || 5432),
        database: process.env.PGDATABASE || 'eloyer',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
        ssl: useSsl ? { rejectUnauthorized: false } : false,
      }
);

module.exports = pool;
