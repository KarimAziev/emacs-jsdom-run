import * as util from 'util';

var MAX_LENGTH = 360;
var MIN_LENGTH = 280;
var COUNT = 100;
var count = 0;

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'log';
export const LEVELS: LogLevel[] = [
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'log',
];

export interface LogItem {
  id: number;
  date: number;
  level: LogLevel;
  text: string;
}

class Logger {
  public fatal!: Console['error'];
  public error!: Console['error'];
  public log!: Console['log'];
  public warn!: Console['warn'];
  public info!: Console['info'];
  public debug!: Console['debug'];
  private _logs: LogItem[] = [];
  static levels: LogLevel[] = [
    'fatal',
    'error',
    'warn',
    'info',
    'debug',
    'log',
  ];
  constructor() {
    Logger.levels.forEach((level) => {
      this[level] = (...args: any[]) => {
        const now = Date.now();
        this.logs.push({
          id: now + ++count,
          date: now,
          level: level,
          text: util.format.apply(null, args),
        });
        const len = this.logs.length;
        if (len > MAX_LENGTH) {
          this.logs = this.logs.slice(len - MIN_LENGTH, len);
        }
      };
    });

    this.reset = this.reset.bind(this);
    this.getLogs = this.getLogs.bind(this);
  }

  get logs() {
    return this._logs;
  }

  set logs(logs) {
    this._logs = logs;
  }

  reset() {
    this.logs = [];
    return this;
  }

  getLogs(startTime: number, count: number) {
    var len = this.logs.length;
    if (!len || startTime == -1) {
      return [];
    }

    count = Math.min(count || COUNT, len);
    if (startTime === 0) {
      return this.logs.slice(-1);
    }

    if (startTime != -2 && startTime) {
      for (var i = 0; i < len; i++) {
        const log = this.logs[i];
        if (log?.id === startTime) {
          ++i;
          return this.logs.slice(i, i + count);
        }
      }
    }
    return this.logs.slice(0, count);
  }
  _log(text: any, level: LogLevel) {
    const now = Date.now();
    this.logs.push({
      id: now + ++count,
      date: now,
      level: level,
      text: text,
    });
    const len = this.logs.length;
    if (len > MAX_LENGTH) {
      this.logs = this.logs.slice(len - MIN_LENGTH, len);
    }
  }
}

export default new Logger();
