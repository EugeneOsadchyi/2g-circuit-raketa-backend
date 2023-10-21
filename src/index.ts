import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';
import { createStream } from 'rotating-file-stream';

const logDirectory = path.join(__dirname, '../logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const stream = createStream('websocket-messages.log', {
  rotate: 600000, // Rotate the log file every 10 minutes (600,000 milliseconds)
  path: logDirectory,
  size: '10M', // limit file size to 10MB
  compress: 'gzip', // Compress old log files
});

const WEBSOCKET_URL = process.env.WEBSOCKET_URL || 'wss://webserver10.sms-timing.com:10015';
const ws = new WebSocket(WEBSOCKET_URL);

ws.on('open', () => {
  console.log('Connected to WebSocket server');

  const message = {
    "$type": "BcStart",
    "ClientKey": "2gcircuit",
    "ResourceId": "19495",
    "Timing": true,
    "Notifications": true,
    "Security": "THIRD PARTY TV",
  };

  ws.send(JSON.stringify(message));
});

ws.on('message', (data) => {
  stream.write(data + '\n');
});

process.on('SIGINT', () => {
  console.log('Stopping program');
  ws.close();
});

process.on('exit', () => {
  console.log('Exiting program');
  stream.end();
});
