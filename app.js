"use strict";

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const router = express.Router();

router.use((request, response, next) => {
  console.log(request.method, request.url);
  next();
});

router.get('/message_deliveries', (request, response) => {
  const url_parts = url.parse(request.url, true);
  if (url_parts.query['hub.verify_token'] === 'a-stray-dog-starved-for-dreams-howls-tonight') {
    response.send(url_parts.query['hub.challenge']);
  }
});

app.post('/webhook/', bodyParser.json(), (req, res) => {
  const messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    const event = req.body.entry[0].messaging[i];
    const sender = event.sender.id;
    if (event.message && event.message.text) {
      const text = event.message.text;
      console.dir(text);
      // Handle a text message from this sender
    }
  }
  res.sendStatus(200);
});

app.use('/', router);

app.listen(5050);
console.log("Server is listening");
