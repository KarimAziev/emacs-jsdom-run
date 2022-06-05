export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'log';
export const LEVELS = [
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'log',
] as const;

export class Logger {
  public fatal!: Console['error'];
  public error!: Console['error'];
  public log!: Console['log'];
  public warn!: Console['warn'];
  public info!: Console['info'];
  public debug!: Console['debug'];
  static levels: typeof LEVELS = LEVELS;
  constructor() {
    Logger.levels.forEach((level) => {
      this[level] = (...args: any[]) => {
        const now = new Date();
        const timestamp =
          now.getHours() +
          ':' +
          now.getMinutes() +
          ':' +
          now.getSeconds() +
          ':' +
          now.getMilliseconds();
        console[level].apply(null, [`** ${level} ${timestamp}\n`, ...args]);
      };
    });
  }
}

export const formatCurrTime = () => {
  const now = new Date();
  return (
    now.getHours() +
    ':' +
    now.getMinutes() +
    ':' +
    now.getSeconds() +
    ':' +
    now.getMilliseconds()
  );
};

export const formatRequestParams = ({
  dir,
  code,
}: {
  code: string;
  dir: string;
}) => `\n#+begin_src js ${dir ? ':dir=' + dir : ''}\n${code}#+end_src\n`;
export const formatHtml = (html: string) =>
  `\n#+begin_export html\n${html}\n#+end_export\n`;

export const log = (...args: any[]) => {
  return console.log.apply(null, args);
};

export default new Logger();
