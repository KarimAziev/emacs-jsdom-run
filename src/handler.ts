import * as vm from 'vm';
import createWindowContext, {
  WindowContextParams,
} from './utils/windowContext';
import logger from './utils/log';
import { expandNodeModules, windowRequire } from './utils/files';
import { serializeCode } from './utils/serialize';

export let CONTEXT: { [key: string]: any };
let contentUrl: string;

export interface EvalParams extends WindowContextParams {
  code: string;
  url: string;
  reset: boolean;
  file: string;
  rootDir: string;
  nodeModulesPaths?: string[];
}

const DEFAULTS = {
  html: "<!doctype html><html><body><div id='root'></div></body></html>",
  url: 'http://localhost:3000',
};
// const vm = require('vm');

const handler = async (body: EvalParams) => {
  const {
    code,
    html,
    nodeModulesPaths = [],
    rootDir,
    reset,
    url,
    ...jsdomParams
  } = body;
  let result;

  const nodeModulesPath = [...nodeModulesPaths, expandNodeModules(rootDir)];

  contentUrl = url || contentUrl || DEFAULTS.url;
  logger.reset();
  if (!CONTEXT || reset) {
    CONTEXT = createWindowContext({
      html: html || DEFAULTS.html,
      url: contentUrl,
      ...jsdomParams,
    });
  }

  return new Promise((resolve) => {
    vm.createContext(CONTEXT);
    CONTEXT['require'] = (dependency: string) =>
      windowRequire(dependency, nodeModulesPath);
    CONTEXT.exports = {};
    CONTEXT.console = {};
    try {
      result = vm.runInContext(code, CONTEXT);
      console.log('RESULT', result);
    } catch (error) {
      result = error.message;
    }

    if (result && 'function' === typeof result.then) {
      result.then(
        (d: any) =>
          resolve({
            result: serializeCode(d),
            logs: logger.logs,
            url: contentUrl,
          }),
        (d: any) =>
          resolve({
            result: serializeCode(d),
            logs: logger.logs,
            url: contentUrl,
          })
      );
    } else {
      resolve({
        result: serializeCode(result),
        logs: logger.logs,
        url: contentUrl,
      });
    }
  });

  // const sandbox = {
  //     a: 1
  //   };
  //   await new Promise(resolve => {
  //     sandbox.resolve = resolve;
  //     const code = 'Promise.resolve(2).then(result => {a = result; resolve();})';
  //     const script = new vm.Script(code);
  //     const context = new vm.createContext(sandbox);
  //     script.runInContext(context);
  //   });
};

export default handler;
