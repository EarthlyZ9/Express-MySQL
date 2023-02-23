const { Sequelize, DataTypes } = require('sequelize');

const env = process.env.NODE_ENV || 'development';
console.log('env: ' + env);
const config = require(__dirname + '/../config/config.js')[env];
console.log(config.host);

const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    timezone: '+09:00',
    dialectOptions: {
      charset: 'utf8mb4',
      dateStrings: true,
      typeCast: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.users = require('./user')(sequelize, DataTypes);
db.posts = require('./post')(sequelize, DataTypes);

db.users.hasMany(db.posts, {
  foreignKey: 'userId',
  as: 'posts',
});

db.posts.belongsTo(db.users, {
  foreignKey: 'userId',
  as: 'user',
});

db.sequelize
  .sync({ force: false })
  .then(() => {
    console.log('sync finished');
  })
  .catch((err) => {
    console.error(err);
  });

module.exports = db;
