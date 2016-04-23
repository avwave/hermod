const http = require('http');
const url = require('url');
const server = http.createServer((request, response) => {
  let url_parts = url.parse(request.url)
  console.dir(url_parts);
  if (request.query['hub.verify_token'] === 'a-stray-dog-starved-for-dreams-howls-tonight') {
    response.write(req.query['hub.challenge']);
  }

  response.end();
});

server.listen(5050);
console.log("Server is listening");
