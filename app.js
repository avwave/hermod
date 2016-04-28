"use strict";
var config = require('./config.js');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require('request');
const parseString = require('xml2js').parseString;
const WolframClient = require('node-wolfram');
const Wolfram = new WolframClient(config.wolfram_app_key);

const User = require('./camo_db').User;

const _ = require('lodash');

const router = express.Router();

router.use((request, response, next) => {
  console.log(request.method, request.url);
  next();
});

router.get('/__message_deliveries', (request, response) => {
  const url_parts = url.parse(request.url, true);
  if (url_parts.query['hub.verify_token'] === 'a-stray-dog-starved-for-dreams-howls-tonight') {
    response.send(url_parts.query['hub.challenge']);
  }
});

const token = config.access_token;

var sendTextMessage = (sender, text) => {
  const messageData = {
    text: `echo: ${text}`
  };
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: token},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: messageData
    }
  }, (error, response, body) => {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
};

var ask_wolfram = (sender, text) => {
  Wolfram.query(text,  (error, result) => {
    if (error) throw error
    let primary_result = _.find(result.queryresult.pod, ['$.title', 'Result'])
    let answer = "I don't know, sorry";
    if (primary_result) {
      answer = _.join(_.map(primary_result.subpod, 'plaintext'), ',')
    }
    console.dir(primary_result);
    console.dir(answer);

    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: token},
      method: 'POST',
      json: {
        recipient: {id: sender},
        message: {
          text: answer
        }
      }
    }, (error, response, body) => {
      if (error) {
        console.log('Error sending message: ', error);
      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
      }
    });
  });

};


var sendCats = (sender, text) => {
  request
    .get('http://thecatapi.com/api/images/get?format=xml', (error, response, body) => {

      let catUrl = '';
      parseString(response.body, {explicitArray: false}, (error,  result) =>{
        catUrl = result.response.data.images.image.url;
        let messageData = {
          "attachment": {
            "type": "template",
            "payload": {
              "template_type": "generic",
              "elements": [{
                "image_url": catUrl,
                "title": "Cat",
              }]
            }
          }
        };
        request({
          url: 'https://graph.facebook.com/v2.6/me/messages',
          qs: {access_token: token},
          method: 'POST',
          json: {
            recipient: {id: sender},
            message: messageData
          }
        }, (error, response, body) => {
          if (error) {
            console.log('Error sending message: ', error);
          } else if (response.body.error) {
            console.log('Error: ', response.body.error);
          }
        });
      });
    });
};


app.post('/message_deliveries', bodyParser.json(), (req, res) => {
  for (let entry of req.body.entry) {
    const messaging_events = entry.messaging;
    for (let messaging_event of messaging_events) {
      const event = messaging_event;
      const sender = event.sender.id;
      
      if (event.message && event.message.text) {
        const text = event.message.text;
        console.dir(text);
        if (text === 'cat pls') {
          sendCats(sender, text)
        } else {
          // sendTextMessage(sender, text)
          ask_wolfram(sender,  text)
        }
      }
    }
  }
  res.sendStatus(200);
});

router.post('/brain', bodyParser.json(), (req, res) => {
  ask_wolfram(null, "highest mountain in the philippines?");
  res.sendStatus(200);
});

app.use('/', router);

app.listen(5050);
console.log("Server is listening");

