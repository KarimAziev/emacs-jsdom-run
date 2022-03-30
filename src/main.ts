import http from 'http';
import evalHandler from './handler';

const HOSTNAME = '127.0.0.1';
const PORT = 24885;

const getReqBody = async (req: http.IncomingMessage) => {
  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  const data = JSON.parse(Buffer.concat(buffers).toString());

  return data;
};

const server = http.createServer(async (req, res) => {
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

server.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}`);
});

export default server;
