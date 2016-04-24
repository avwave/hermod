"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require('request');
const parseString = require('xml2js').parseString;
const wolfram = require('wolfram').createClient('XWG4W2-HWVP2RXRTH');

const _ = require('lodash')

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

var ask_wolfram = (sender, text) => {
  wolfram.query(text,  (error, result) => {
    if (error) throw error
    let primary_result = _.find(result, ['primary', true])
    let answer = "I don't know, sorry";
    if (primary_result) {
      answer = primary_result.subpods[0].value
    }

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
  console.dir(req.body.question)
  ask_wolfram('', req.body.question)
});

app.use('/', router);

app.listen(5050);
console.log("Server is listening");
