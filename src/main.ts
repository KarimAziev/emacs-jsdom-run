import http from 'http';
import evalHandler from './handler';
import { formatCurrTime } from './logger';

const HOSTNAME = process.env.HOSTNAME || '127.0.0.1';
const PORT = process.env.PORT ? Number(process.env.PORT) : 24885;

const getReqBody = async (req: http.IncomingMessage) => {
  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  const data = JSON.parse(Buffer.concat(buffers).toString());

  return data;
};

const httpServer = http.createServer(async (req, res) => {
  const body = await getReqBody(req);

  let result;
  try {
    result = await evalHandler(body);
  } catch (error) {
    result = error;
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(result));
});

httpServer.listen(PORT, HOSTNAME, undefined, () => {
  process.on('SIGINT', function () {
    console.log('SIGINT trapped, killing emacs-jsdom');
    process.exit();
  });
  process.on('SIGTERM', function () {
    console.log('SIGTERM trapped, killing emacs-jsdom');
    process.exit();
  });
  console.log(
    `* Session started at http://${HOSTNAME}:${PORT} ${formatCurrTime()}`
  );
});

export default httpServer;
