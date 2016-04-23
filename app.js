"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require('request');

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

const token = "CAAHladUiTLcBAGQkxg7JvJ32HPBmZCgnUEiAcTZA6pRDVay5jnQDnWCF2gAcZASn3w9xUNJAAAcZADDmMLLTpyBtOWZArMZAt4mU1hhGp4W4a5ugt4ZBzX9LErskvtHG3wBIB96nrI0n8OkOeUtC529KsElDcE8memsMiiyfCcVyfWClYHZCZAuRvqJmnTZAwzI88ZD";

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


var sendCats = (sender, text) => {
    var imageURL = "http://thecatapi.com/api/images/get?r=" + Math.floor((Math.random() * 10) + 1);
    const messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Meow",
          "subtitle": "Meow meow, meow-meow",
          "image_url": imageURL,
          "buttons": [{
            "type": "web_url",
            "url": "thecatapi.com",
            "title": "Web url"
          }]
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
};


app.post('/message_deliveries', bodyParser.json(), (req, res) => {
  const messaging_events = req.body.entry[0].messaging;
  for (let i = 0; i < messaging_events.length; i++) {
    const event = req.body.entry[0].messaging[i];
    const sender = event.sender.id;
    if (event.message && event.message.text) {
      const text = event.message.text;
      console.dir(text);
      if (text === 'cat pls') {
        sendCats(sender, text)
      } else {
        sendTextMessage(sender, text)
      }
    }
  }
  res.sendStatus(200);
});

app.use('/', router);

app.listen(5050);
console.log("Server is listening");
