import { WebSocketServer } from 'ws';

import sample from '../sample/pre-endurance-trainings-21-21.json';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('Client connected');

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
      }, 1000);
    }
  });
});
