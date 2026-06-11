const { Pool } = require('pg');
require('dotenv').config();
const getDbConfig = require('./dbConfig');

const pool = new Pool(getDbConfig({ options: `-c search_path=${process.env.DB_SCHEMA}` }));

module.exports = pool;
