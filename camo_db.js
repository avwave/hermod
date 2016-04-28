"use strict";

var config = require('./config.js');
var Sequelize = require('Sequelize');
var db = new Sequelize(config.dburi);

var User = db.define('user', {
  fbUserId: {
    type: Sequelize.STRING
  },
  firstEncounter: {
    type: Sequelize.DATE
  },
  lastEncounter: {
    type: Sequelize.DATE
  }
}, {
  freezeTableName: true
});

User.sync({force:true}).then( () => {
  console.log('User table created');
});


module.exports.User = User;
