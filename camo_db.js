"use strict";

var config = require('./config.js');
var Sequelize = require('Sequelize');
var db = new Sequelize(config.dburi);

var User = db.define('user', {
  fbUserId: {
    type: Sequelize.STRING
  },
  firstEncounter: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  },
  lastEncounter: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  freezeTableName: true
});


var Message = db.define('message', {
  query: {
    type: Sequelize.TEXT
  },
  response: {
    type: Sequelize.TEXT
  }
});

Message.belongsTo(User);
User.hasMany(Message);

User.sync({force: true}).then(() => {
  console.log('User table created');
});

Message.sync({force: true}).then(() => {
  console.log('Message table created');
});

module.exports.User = User;
module.exports.Message = Message;
