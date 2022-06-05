#!/usr/bin/env node
const path = require('path');
const { createDOMContext } = require('../lib/createContext.js');

const historyPath = () => {
  const p = process.env.NODE_REPL_HISTORY;
  if (p) return p;
  const home = process.env.HOME || process.cwd();
  return path.resolve(home, '.node_repl_history');
};

const WELCOME = `Welcome to Node.js Repl with JSDOM context.
Type ".help" for more information.
`;

console.log(WELCOME);

const repl = require('repl').start({
  useGlobal: true,
  preview: true,
});

function injectGlobalWindow(globalObject, jsdomArgs = {}) {
  const context = createDOMContext({
    url: 'http://localhost:8000',
    ...jsdomArgs,
  });
  const allWindowProps = Object.getOwnPropertyNames(context);
  const enumerableWindowProps = Object.keys(context);
  allWindowProps.forEach((windowProp) => {
    try {
      if (!globalObject[windowProp]) {
        Object.defineProperty(globalObject, windowProp, {
          value: context[windowProp],
          enumerable: !!~enumerableWindowProps.indexOf(windowProp),
        });
      }
    } catch (e) {
      console.log('skipping property: ' + windowProp);
    }
  });
  globalObject.window = context.window;
}

repl.setupHistory(historyPath(), (err, replServer) => {
  if (err) {
    console.log(err);
  } else {
    injectGlobalWindow(replServer.context, { dir: process.cwd() });
  }
});
