import * as vm from 'vm';
import createWindowContext, {
  WindowContextParams,
} from '../utils/windowContext';
import logger from '../utils/log';
import { expandNodeModules, windowRequire } from '../utils/files';
import { serializeCode } from '../utils/serialize';

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

const handler = (body: EvalParams) => {
  const {
    code,
    html,
    nodeModulesPaths = [],
    rootDir,
    reset,
    url,
    ...jsdomParams
  } = body;
  const nodeModulesPath = [...nodeModulesPaths, expandNodeModules(rootDir)];

  contentUrl = url || contentUrl || DEFAULTS.url;

  if (!CONTEXT || reset) {
    logger.reset();
    CONTEXT = createWindowContext({
      html: html || DEFAULTS.html,
      url: contentUrl,
      ...jsdomParams,
    });
    vm.createContext(CONTEXT);
    CONTEXT['require'] = (dependency: string) =>
      windowRequire(dependency, nodeModulesPath);
  }

  return {
    result: serializeCode(vm.runInContext(code, CONTEXT)),
    logs: logger.logs,
    url: contentUrl,
    context: serializeCode(CONTEXT),
  };
};

export default handler;
