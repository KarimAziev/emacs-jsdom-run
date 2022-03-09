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
      this.txtLogger.writeToLogFile('Request Made: GET /test');

      const status = 200;
      res.status(status).send();

      this.txtLogger.writeToLogFile(
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
    this.router.post('/test', (req: Request, res: Response) => {
      this.txtLogger.writeToLogFile('Request Made: POST /test');

      res.status(200).send();

      this.txtLogger.writeToLogFile(
        `Request Completed:
            POST: ${req.url},
            Host: ${req.hostname},
            IP: ${req.ip},
            Type: ${req.protocol?.toUpperCase()},
            Status: ${200}.`
      );
    });

    this.router.post('/eval', (req: Request<EvalParams>, res: Response) => {
      this.txtLogger.writeToLogFile(
        `Request Made: POST /eval'
         Request Body: ${util.format.apply(null, req.body)}`
      );

      try {
        const result = evalHandler(req.body);
        res.status(200).send(JSON.stringify(result));
        this.txtLogger.writeToLogFile(`Request Completed:
            POST: ${req.url},
            Host: ${req.hostname},
            IP: ${req.ip},
            Type: ${req.protocol?.toUpperCase()},
            Status: ${200},
            Body: ${result}.`);
      } catch (error) {
        res.status(500).send(error);
        this.txtLogger.writeToLogFile(
          `Request Error:
            POST: ${req.url},
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
