import * as jsdom from 'jsdom';

export const prompt: jsdom.DOMWindow['prompt'] = function (message, _default) {
  const str = `"(read-string \\"${message}\\" \\"${_default || ''}\\")"`;

  try {
    return JSON.parse(
      require('child_process')
        .execSync('emacsclient --eval ' + str)
        .toString('utf8')
    );
  } catch (_error) {
    return null;
  }
};

export const alert: jsdom.DOMWindow['alert'] = function (message) {
  require('child_process').execSync(
    'emacsclient -n --eval "(x-popup-dialog t \'(\\"\n' +
      new Array(80).fill('').join(' ') +
      '\n\t\t' +
      message +
      '\\") t)"'
  );
};

export const confirm: jsdom.DOMWindow['confirm'] = function (message) {
  try {
    return require('child_process')
      .execSync(
        'emacsclient -n --eval "(x-popup-dialog t \'(\\"' +
          message +
          '\\" (\\"Yes\\" t) (\\"Cancel\\" nil)))"'
      )
      .toString('utf8')
      .trimRight()
      .split('')
      .includes('t');
  } catch (_error) {
    return false;
  }
};

export const injectEmacsHandlers = <T extends jsdom.DOMWindow>(context: T) => {
  context.prompt = prompt;
  context.alert = alert;
  context.confirm = confirm;
};
