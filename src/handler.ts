import * as vm from 'vm';
import * as path from 'path';
import createWindowContext, {
  WindowContextParams,
} from './utils/windowContext';
import logger, { Logger } from './utils/log';
import { expandNodeModules, createRequire } from './utils/files';
import { serializeCode } from './utils/serialize';

export let CONTEXT: { [key: string]: any };
let contentUrl: string;

export function isString(v: any): v is string {
  return v;
}

export interface EvalParams extends WindowContextParams {
  code: string;
  url: string;
  reset: boolean;
  file?: string;
  rootDir?: string;
  dirname?: string;
  nodeModulesPaths?: string | string[];
}

const DEFAULTS = {
  html: "<!doctype html><html><body><div id='root'></div></body></html>",
  url: 'http://localhost:3000',
};

const handler = async (body: EvalParams) => {
  const {
    code,
    html,
    nodeModulesPaths = [],
    dirname,
    rootDir,
    reset,
    url,
    file,
    ...jsdomParams
  } = body;
  console.log('REQUEST:\n', body);
  return new Promise(function (resolve) {
    let result;
    logger.reset();

    const dir = dirname || (file && path.dirname(file));
    const nodeModulesPath = Array.isArray(nodeModulesPaths)
      ? [...nodeModulesPaths, expandNodeModules(rootDir)].filter(isString)
      : [nodeModulesPaths, expandNodeModules(rootDir)].filter(isString);

    const script = new vm.Script(code);
    const htmlScript = new vm.Script('document.documentElement.outerHTML');
    contentUrl = url || contentUrl || DEFAULTS.url;

    if (!CONTEXT || reset) {
      CONTEXT = createWindowContext({
        html: html || DEFAULTS.html,
        url: contentUrl,
        ...jsdomParams,
      });
      CONTEXT.exports = {};
    }

    CONTEXT['require'] = createRequire(nodeModulesPath, dir);
    Logger.levels.forEach(function (level) {
      CONTEXT.console[level] = logger[level];
    });
    vm.createContext(CONTEXT);

    try {
      result = reset
        ? script.runInNewContext(CONTEXT)
        : script.runInContext(CONTEXT);
      if (result && 'function' === typeof result.then) {
        result.then(
          (d: any) =>
            resolve({
              result: serializeCode(d),
              logs: logger.logs,
              url: contentUrl,
              html: htmlScript.runInContext(CONTEXT),
            }),
          (d: any) =>
            resolve({
              result: serializeCode(d),
              logs: logger.logs,
              url: contentUrl,
              html: htmlScript.runInContext(CONTEXT),
            })
        );
      } else {
        resolve({
          result: serializeCode(result),
          logs: logger.logs,
          url: contentUrl,
          html: htmlScript.runInContext(CONTEXT),
        });
      }
    } catch (error) {
      resolve({
        result: error.message,
        logs: logger.logs,
        url: contentUrl,
        html: htmlScript.runInContext(CONTEXT),
      });
    }
  });
};

export default handler;
