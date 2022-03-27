import * as util from 'util';
import { Request, Response } from 'express';
import { ServerSetup } from './ServerSetup';
import evalHandler, { EvalParams } from './controllers/eval';

export class Server extends ServerSetup {
  constructor(port?: string, hostname?: string) {
    super(port, hostname);
    this.getRequests();
    this.postRequests();
  }

  private getRequests(): void {
    this.router.get('/test', (req: Request, res: Response) => {
      /* eslint-disable-next-line no-console */
      console.log('Request Made: GET /test');
      const status = 200;
      res.status(status).send();
      /* eslint-disable-next-line no-console */
      console.log(
        `Request Completed:
            GET: ${req.url},
            Host: ${req.hostname},
            IP: ${req.ip},
            Type: ${req.protocol?.toUpperCase()},
            Status: ${status}.`
      );
    });
  }

  private postRequests(): void {
    this.router.post('/eval', (req: Request<EvalParams>, res: Response) => {
      /* eslint-disable-next-line no-console */
      console.log(
        `Request Made: POST /eval'
         Request Body: ${util.format.apply(null, [req.body])}`
      );

      try {
        const result = evalHandler(req.body);
        res.status(200).send(JSON.stringify(result));
        /* eslint-disable-next-line no-console */
        console.log(`Request Completed:
            POST: ${req.url},
            Host: ${req.hostname},
            IP: ${req.ip},
            Type: ${req.protocol?.toUpperCase()},
            Status: ${200},
            Body: ${result}.`);
      } catch (error) {
        res.status(500).send(error);
        /* eslint-disable-next-line no-console */
        console.error(
          `Request Error:
            POST: ${req.url},
            Request Body: ${util.format.apply(null, [req.body])}
            Host: ${req.hostname},
            IP: ${req.ip},
            Type: ${req.protocol?.toUpperCase()},
            Error: ${error.message}
            Status: ${500}.`
        );
      }
    });
  }
}
