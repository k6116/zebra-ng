

var Sequelize = require('sequelize')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './options.db'
});

function connect() {

  sequelize
    .authenticate()
    .then(() => {
      console.log(`SQLite connection to database '${sequelize.storage}' has been established successfully`);
      // console.log(sequelize)
    })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });

}

module.exports = {
  sequelize: sequelize,
  connect: connect
};
