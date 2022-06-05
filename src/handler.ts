import * as vm from 'vm';
import * as util from 'util';
import * as path from 'path';
import * as jsdom from 'jsdom';
import { Types } from 'jsdom-context-require';
import logger, { log, formatHtml, formatCurrTime } from './logger';
import { serializeCode } from './serialize';
import { createDOMContext } from './createContext';
import { runCode } from './runCode';
import { formatCode } from './formatCode';

export let CONTEXT: Types.JSDOMModule & jsdom.DOMWindow;
export let lastHtml: string;
export let prevDir: string;

export interface RequestBodyParams extends jsdom.ConstructorOptions {
  code: string;
  reset: boolean;
  html?: string;
  url?: string;
  file?: string;
  dir?: string;
}

export function isElement(element: any): element is Element {
  if (CONTEXT && CONTEXT.window) {
    return element instanceof CONTEXT.window.Element;
  } else {
    return false;
  }
}
const DEFAULTS = {
  html: "<!doctype html><html><body><div id='root'>Hello world</div></body></html>",
  url: 'http://localhost:3000',
};
export const setupVMContext = ({
  reset,
  dir,
  file,
  ...jsdomParams
}: Omit<RequestBodyParams, 'code'>) => {
  const dirname = dir || (file && path.dirname(file)) || process.cwd();
  if (reset || prevDir !== dirname || !CONTEXT) {
    CONTEXT = createDOMContext({
      dir: dirname,
      ...DEFAULTS,
      ...jsdomParams,
    });
  }
  CONTEXT.exports = {};
  lastHtml = CONTEXT.document.documentElement.outerHTML;
  prevDir = dirname;
  vm.createContext(CONTEXT);
};

const handler = async (body: RequestBodyParams) => {
  const { code, ...jsdomParams } = body;
  setupVMContext(jsdomParams);
  if (!code) {
    return;
  }
  return new Promise(function (resolve) {
    try {
      runCode(code, CONTEXT).then(
        (res) => {
          const serialized = isElement(res)
            ? util.format(res)
            : formatCode(serializeCode(res));

          console.log(
            `** Result ${formatCurrTime()}\n#+BEGIN_SRC javascript\n${util.format(
              res
            )}\n#+END_SRC`
          );
          const html = vm.runInContext(
            'document.documentElement.outerHTML',
            CONTEXT
          );
          if (lastHtml !== html) {
            log(formatHtml(html));
          }

          resolve({
            result: serialized,
            html: html,
          });
        },
        (error) => {
          logger.error(error.message);
          resolve({
            result: error.message,
          });
        }
      );
    } catch (error) {
      logger.error(error.message);
      resolve({
        result: error.message,
      });
    }
  });
};

export default handler;
