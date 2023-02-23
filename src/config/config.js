require('dotenv').config();

const { DB_PASSWORD, DB_NAME, DB_USER, DB_HOST } = process.env;

const development = {
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  host: '127.0.0.1',
  dialect: 'mysql',
};

const production = {
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  host: DB_HOST,
  dialect: 'mysql',
};

module.exports = { development, production };
