"use strict";

var config = require('./config.js');

const connect = require('camo').connect;
const Document = require('camo').Document;
var database;


class User extends (Document) {
  constructor() {
    super();
    this.messengerId = {
      type: String
    };
    this.firstEncounter = {
      type: Date,
      default: new Date()
    };
    this.lastEncounter = {
      type: Date
    };
  }

  preSave() {
    console.dir(this)
    if (!this.firstEncounter) {
      this.firstEncounter = new Date()
    }
  }

  static collectionName() {
    return 'user';
  }
}


connect(config.dburi).then((db)=> {
  database = db;
});

var addUser = (fbUserId) => {
  var userObj = {
    messengerId: fbUserId,
    lastEncounter: new Date()
  };

  User.findOne({messengerId: fbUserId}).then(u=>{
    if (!u) {
      console.log('creating user');
      let user = User.create(userObj);
      user.save()
    } else {
      console.log('updating user');
      u.lastEncounter = new Date();
      u.save();
    }
  });

};

module.exports.db = database;
module.exports.User = User;
module.exports.addUser = addUser;
