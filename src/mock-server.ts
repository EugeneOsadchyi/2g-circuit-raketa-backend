import { WebSocketServer } from 'ws';
import { generatorFromJsonSample, generatorFromLogSample } from './utils/generators';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws, req) {
  console.log('Client connected');

  let sampleGenerator: AsyncGenerator<string>;

  if (req.url === '/endurance') {
    sampleGenerator = generatorFromJsonSample('../sample/endurance-timing.json');
  } else if (req.url === '/training-1') {
    sampleGenerator = generatorFromJsonSample('../sample/pre-endurance-trainings-20-55.json')
  } else if (req.url === '/training-2') {
    sampleGenerator = generatorFromJsonSample('../sample/pre-endurance-trainings-21-21.json')
  } else if (req.url === '/race') {
    sampleGenerator = generatorFromLogSample('../sample/race-22-10-2023.log')
  } else {
    console.error("No sample found for this URL");
    return ws.close();
  }

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
      interval = setInterval(async () => {
        const { value, done } = await sampleGenerator.next();

        if (!done) {
          return ws.send(value);
        }

        ws.close();
      }, 500);
    }
  });
});
