import fs from 'fs';
import path from 'path';
import { createStream } from 'rotating-file-stream';

const logDirectory = path.join(__dirname, '../../logs/need-for-speed');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const stream = createStream('telemetry.log', {
  rotate: 3600000, // Rotate the log file every 60 minutes (3,600,000 milliseconds)
  path: logDirectory,
  size: '50M', // limit file size to 50MB
  compress: 'gzip', // Compress old log files
});

const DATA_URL = 'https://nfs-stats.herokuapp.com/getmaininfo.json';
const FETCH_INTERVAL = 1000;

const fetchDataInterval = setInterval(() => {
  fetch(DATA_URL)
    .then((response) => response.json())
    .then((data) => {
      stream.write(JSON.stringify(data) + '\n');
    })
    .catch((error) => {
      console.error(error);
    });
}, FETCH_INTERVAL);

process.on('SIGINT', () => {
  console.log('Stopping program');
  clearInterval(fetchDataInterval);
});

process.on('exit', () => {
  console.log('Exiting program');
  stream.end();
});
