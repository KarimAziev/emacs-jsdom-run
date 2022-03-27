import * as jsdom from 'jsdom';
import logger from './log';

export interface WindowContextParams extends jsdom.ConstructorOptions {
  html: string;
}

const createWindowContext = function ({ html, ...rest }: WindowContextParams) {
  /* eslint-disable-next-line no-var */
  var html =
    html || "<!doctype html><html><body><div id='root'></div></body></html>";
  /* eslint-disable-next-line no-var */
  var global: Record<string, any> = {};
  /* eslint-disable-next-line no-var */
  var dom = new jsdom.JSDOM(html, rest);

  const window = dom.window;
  window.Buffer = Buffer;
  window.process = { ...process, browser: true };
  window.setImmediate =
    window.setImmediate ||
    (() => {
      const msg = `${Math.random()}`;
      let queue: Array<((...args: unknown[]) => void) | undefined> = [];
      let offset = 0;

      window.addEventListener('message', (ev) => {
        if (ev.data === msg) {
          const cbs = queue;
          offset += cbs.length;
          queue = [];
          for (const cb of cbs) {
            if (cb) {
              cb();
            }
          }
        }
      });

      window.clearImmediate = function clearImmediate(id: number) {
        const index = id - offset;
        if (index >= 0) {
          queue[index] = undefined;
        }
      };

      return function setImmediate(
        cb: (...args: unknown[]) => void,
        ...args: unknown[]
      ) {
        const index = queue.push(args.length ? () => cb(...args) : cb) - 1;
        if (!index) {
          window.postMessage(msg, '*');
        }
        return index + offset;
      };
    })();

  global['window'] = window;
  global['document'] = window.document;
  global['navigator'] = {
    userAgent: 'node.js',
  };
  /* eslint-disable-next-line @typescript-eslint/ban-types */
  global['requestAnimationFrame'] = function (callback: Function) {
    return setTimeout(callback, 0);
  };

  global['cancelAnimationFrame'] = function (id?: number) {
    clearTimeout(id);
  };

  const prompt: jsdom.DOMWindow['prompt'] = function (message, defaultValue) {
    const str = `"(read-string \\"${message}\\" \\"${defaultValue || ''}\\")"`;
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    const child = require('child_process').execSync(
      'emacsclient --eval ' + str
    );
    return eval(child.toString('utf8').trimRight());
  };

  const alert: jsdom.DOMWindow['alert'] = function (message: string) {
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    require('child_process')
      .execSync(
        'emacsclient -n --eval "(minibuffer-message \\"ALERT: ' +
          message +
          '\\")"'
      )
      .toString();
    return undefined;
  };

  const confirm = function (message: string) {
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    const child = require('child_process').execSync(
      'emacsclient -n --eval "(yes-or-no-p \\"' + message + '\\")"'
    );
    return child.toString();
  };

  window.prompt = prompt;
  window.alert = alert;
  window.confirm = confirm;

  window['console'] = {
    ...window['console'],
    fatal: logger.fatal,
    error: logger.error,
    warn: logger.warn,
    info: logger.info,
    debug: logger.debug,
    log: logger.log,
  };

  return Object.defineProperties(global, {
    ...Object.getOwnPropertyDescriptors(window),
    ...Object.getOwnPropertyDescriptors(global),
  });
};

export default createWindowContext;
