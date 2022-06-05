import * as jsdom from 'jsdom';
import createJSDOMContextRequire, { Types } from 'jsdom-context-require';
import logger, { Logger } from './logger';
import { injectEmacsHandlers } from './emacs';

export const beforeParse = (window: jsdom.DOMWindow) => {
  Logger.levels.forEach(function (level) {
    window.console[level] = logger[level];
  });
  injectEmacsHandlers(window);
};

export const createDOMContext = (
  params: Types.Options
): Types.JSDOMModule & jsdom.DOMWindow => {
  const context = createJSDOMContextRequire({ ...params, beforeParse });
  const enumerableProps = Object.keys(context.window);
  Object.getOwnPropertyNames(context.window).forEach((windowProp) => {
    try {
      if (!context[windowProp]) {
        Object.defineProperty(context, windowProp, {
          value: context.window[windowProp],
          enumerable: !!~enumerableProps.indexOf(windowProp),
        });
      }
    } catch (e) {
      console.log('omitting property ' + windowProp);
    }
  });
  return context as Types.JSDOMModule & jsdom.DOMWindow;
};
