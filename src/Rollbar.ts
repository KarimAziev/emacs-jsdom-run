import { SimpleTxtLogger } from 'simple-txt-logger';

export class Logger {
  private txtLogger: SimpleTxtLogger;

  public constructor(txtLogger: SimpleTxtLogger) {
    this.txtLogger = txtLogger;
    this.txtLogger.writeToLogFile('Initialized Logging.');
  }

  public log(log: Error | string): void {
    this.txtLogger.writeToLogFile(log);
  }

  public debug(bug: Error | string): void {
    this.txtLogger.writeToLogFile(bug);
  }

  public warn(warning: Error | string): void {
    this.txtLogger.writeToLogFile(warning);
  }

  public error(error: Error | string): void {
    this.txtLogger.writeToLogFile(error);
  }

  public critical(critError: Error | string): void {
    this.txtLogger.writeToLogFile(critError);
  }
}
