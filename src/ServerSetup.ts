import { SimpleTxtLogger } from 'simple-txt-logger';
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
  protected txtLogger: SimpleTxtLogger;
  protected logger: Logger;

  protected constructor(port = '24885', hostname = '127.0.0.1') {
    dotenv.config();
    this.port = process.env['PORT'] || port;
    this.hostname = process.env['HOSTNAME'] || hostname;

    this.txtLogger = new SimpleTxtLogger(
      SimpleTxtLogger.newDateTime(),
      'Server',
      ServerSetup.appName
    );
    this.logger = new Logger(this.txtLogger);
    this.txtLogger.writeToLogFile('...::SERVER-SIDE APPLICATION STARTING::...');

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
    this.txtLogger.writeToLogFile('Configured Server.');
  }

  private serverStart(): void {
    this.server.listen(parseInt(this.port), this.hostname, () =>
      this.txtLogger.writeToLogFile(
        `Started HTTP Server: http://${this.hostname}:${this.port}`
      )
    );
  }
  public appAccessor(app = this.app): express.Express {
    return app;
  }
}
