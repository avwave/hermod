const http = require('http');
const server = http.createServer((request, response) => {
  response.writeHead(200, {'Content-Type': 'text/plain'})
  response.write('a-stray-dog-starved-for-dreams-howls-tonight')
  response.end();
});

server.listen(5050);
console.log("Server is listening");
