import * as jsdom from 'jsdom';
import logger from './log';

export interface WindowContextParams extends jsdom.ConstructorOptions {
  html: string;
}
// url,
//   referrer,
//   userAgent,
//   includeNodeLocations,
//   runScripts,
//   resources,
//   virtualConsole,
//   cookieJar,
//   pretendToBeVisual,
//   beforeParse,

const createWindowContext = function ({ html, ...rest }: WindowContextParams) {
  var html =
    html || "<!doctype html><html><body><div id='root'></div></body></html>";
  const global: Record<string, any> = {};
  var dom = new jsdom.JSDOM(html, rest);

  const window = dom.window;
  global['window'] = window;
  global['document'] = window.document;
  global['navigator'] = {
    userAgent: 'node.js',
  };
  global['requestAnimationFrame'] = function (callback: Function) {
    return setTimeout(callback, 0);
  };

  global['cancelAnimationFrame'] = function (id?: number) {
    clearTimeout(id);
  };

  const prompt: jsdom.DOMWindow['prompt'] = function (message, defaultValue) {
    const str = `"(read-string \\"${message}\\" \\"${defaultValue || ''}\\")"`;
    const child = require('child_process').execSync(
      'emacsclient --eval ' + str
    );
    return eval(child.toString('utf8').trimRight());
  };

  const alert: jsdom.DOMWindow['alert'] = function (message: string) {
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
