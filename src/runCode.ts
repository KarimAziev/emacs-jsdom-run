import * as vm from 'vm';
import { Types } from 'jsdom-context-require';

export const runCode = (code: string, context: Types.JSDOMModule) => {
  return new Promise((res, rej) => {
    console.time('call start');
    const result = vm.runInContext(code, context);
    console.timeEnd('call end');
    if (result && 'function' === typeof result.then) {
      return result.then(res, rej);
    } else {
      res(result);
    }
  });
};
