import { Logger } from './Rollbar';
import express from 'express';
import * as dotenv from 'dotenv';
import * as http from 'http';

export class ServerSetup {
  static appName = 'EMACS_JSDOM_RUN';
  private port: string;
  private hostname: string;
  private server: http.Server;
  private app: express.Express;
  protected router: express.Router;
  protected logger: Logger;
  protected constructor(port = '24885', hostname = '127.0.0.1') {
    dotenv.config();
    this.port = process.env['PORT'] || port;
    this.hostname = process.env['HOSTNAME'] || hostname;

    this.router = express.Router();
    this.app = express();
    this.server = new http.Server(this.app);

    this.serverConfig();
    this.serverStart();
  }

  private serverConfig(): void {
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use('/', this.router);
  }

  private serverStart(): void {
    this.server.listen(parseInt(this.port), this.hostname, () => {
      process.on('SIGINT', function () {
        /* eslint-disable-next-line no-console */
        console.log('SIGINT trapped, killing emcas-jsdom-run');
        process.exit();
      });
      process.on('SIGTERM', function () {
        /* eslint-disable-next-line no-console */
        console.log('SIGTERM trapped, killing emcas-jsdom-run');
        process.exit();
      });
    });
  }
  public appAccessor(app = this.app): express.Express {
    return app;
  }
}
