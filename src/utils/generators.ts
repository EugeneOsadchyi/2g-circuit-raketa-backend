import { createReadStream } from 'node:fs';
import { createInterface } from 'readline';
import path from 'path';

export async function* generatorFromJsonSample(filePath: string): AsyncGenerator<string> {
  const sample = require(path.join(__dirname, filePath));

  for (let messageId = 1; messageId < sample._webSocketMessages.length; messageId++) {
    yield sample._webSocketMessages[messageId].data;
  }
}

export async function* generatorFromLogSample(filePath: string): AsyncGenerator<string> {
  const stream = createReadStream(path.join(__dirname, filePath));

  const rl = createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    yield line;
  }
}
