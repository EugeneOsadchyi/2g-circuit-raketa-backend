import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws, req) {
  console.log('Client connected');

  let sample: any; // This is bad, but it's just a sample

  if (req.url === '/endurance') {
    sample = require('../sample/endurance-timing-modified.json');
  } else if (req.url === '/training-1') {
    sample = require('../sample/pre-endurance-trainings-20-55.json')
  } else if (req.url === '/training-2') {
    sample = require('../sample/pre-endurance-trainings-21-21.json')
  } else {
    console.error("No sample found for this URL");
    return ws.close();
  }

  let messageId = 1;
  let interval: NodeJS.Timeout;

  ws.on('error', (error) => {
    console.error("Connection error: ", error);
    clearInterval(interval);
  });

  ws.on('close', () => {
    console.log("Connection closed");
    clearInterval(interval);
  });

  ws.on('message', function message(data: string) {
    console.log('received: %s', data);

    if (data.includes("$type\":\"BcStart\",\"ClientKey\":\"2gcircuit\"")) {
      interval = setInterval(() => {
        if (messageId < sample._webSocketMessages.length) {
          return ws.send(sample._webSocketMessages[messageId++].data);
        }

        ws.close();
      }, 5000);
    }
  });
});
