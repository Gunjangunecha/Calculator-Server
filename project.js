const http = require('http');
const url = require('url');
const fs = require('fs');


const MAX_HISTORY_LENGTH = 20;
let history = loadHistory();


const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const params = path.split('/').filter(part => part !== '');


  if (path === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('Welcome to the Server!');
  } else if (path === '/history') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(history));
  } else if (params.length >= 3 && params.length % 2 === 1) {
    const result = calculate(params);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ question: params.join(' '), answer: result }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});


function calculate(params) {
  let result = parseFloat(params[0]);
  for (let i = 1; i < params.length; i += 2) {
    const operator = params[i];
    const num = parseFloat(params[i + 1]);
    if (operator === 'plus') {
      result += num;
    } else if (operator === 'minus') {
      result -= num;
    } else if (operator === 'into') {
      result *= num;
    }
  }
  addToHistory(params.join(' '), result);
  return result;
}


function addToHistory(operation, result) {
  history.unshift({ question: operation, answer: result });
  if (history.length > MAX_HISTORY_LENGTH) {
    history.pop();
  }
  saveHistory();
}


function saveHistory() {
  fs.writeFileSync('history.json', JSON.stringify(history));
}


function loadHistory() {
  try {
    const data = fs.readFileSync('history.json', 'utf8');
    return JSON.parse(data) || [];
  } catch (error) {
    return [];
  }
}


const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
