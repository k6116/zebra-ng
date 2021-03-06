
const Sequelize = require('sequelize');
const sequelize = require('../db/sequelize').sequelize;

const Option = sequelize.define('options',
  {
    id: { type: Sequelize.INTEGER, field: 'ID', primaryKey: true, autoIncrement: true },
    firstName: { type: Sequelize.STRING, field: 'FirstName' },
    lastName: { type: Sequelize.STRING, field: 'LastName' },
    userName: { type: Sequelize.STRING, field: 'UserName' },
    password: { type: Sequelize.STRING, field: 'Password' },
    email: { type: Sequelize.STRING, field: 'Email' },
    lastActivityDate: { type: Sequelize.STRING, field: 'LastActivityDate' }
  },
  {
    schema: 'public',
    tableName: 'User',
    timestamps: false
  }
);

module.exports = Option
