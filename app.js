"use strict";

const http = require('http');
const url = require('url');
const server = http.createServer((request, response) => {
  let url_parts = url.parse(request.url, true)
  console.dir(url_parts.query);
  if (url_parts.query['hub.verify_token'] === 'a-stray-dog-starved-for-dreams-howls-tonight') {
    response.write(url_parts.query['hub.challenge']);
  }

  response.end();
});

server.listen(5050);
console.log("Server is listening");
