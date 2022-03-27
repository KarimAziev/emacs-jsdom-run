interface SCtror {
  thing: any;
  verboseFunctions?: boolean;
  maxStringLength?: number;
}

class Serialize {
  constructor({
    thing,
    verboseFunctions,
    maxStringLength,
  }: {
    thing: any;
    verboseFunctions?: boolean;
    maxStringLength?: number;
  }) {
    this.seen = [];
    this.thing = thing;
    this.verboseFunctions = verboseFunctions;
    this.maxStringLength = maxStringLength;
    this.circular = JSON.stringify('#<Circular>');

    this.isFunction = this.isFunction.bind(this);
    this.isString = this.isString.bind(this);
    this.isArray = this.isArray.bind(this);
    this.isBoolean = this.isBoolean.bind(this);
    this.isNumber = this.isNumber.bind(this);
    this.isWindow = this.isWindow.bind(this);
    this.isWindowNode = this.isWindowNode.bind(this);
    this.isDate = this.isDate.bind(this);
    this.tryStringify = this.tryStringify.bind(this);
    this.annotateFunction = this.annotateFunction.bind(this);
    this.stringify = this.stringify.bind(this);
    this.serialize = this.serialize.bind(this);
    this.annotateFn2 = this.annotateFn2.bind(this);
  }

  static makeSerialize(params: SCtror) {
    return new Serialize(params);
  }

  seen: any[];
  thing: any;
  maxStringLength: any;
  verboseFunctions: any;
  circular = JSON.stringify('#<Circular>');

  isFunction(v: any): v is Function {
    return v instanceof Function || typeof v === 'function';
  }

  isString(v: any): v is string {
    return typeof v === 'string';
  }

  isArray(v: any): v is [] {
    return v instanceof Array || Array.isArray(v);
  }

  isNumber(v: any): v is number {
    return typeof v === 'number';
  }

  isBoolean(v: any): v is boolean {
    return typeof v === 'boolean';
  }

  isWindow(it: any): it is Window {
    return globalThis.window && globalThis.window === it;
  }

  isWindowNode(v: any): v is Node {
    return (
      globalThis.window &&
      globalThis.window.Node != null &&
      v instanceof globalThis.window.Node
    );
  }

  isDate(v: any): v is Node {
    return Object.prototype.toString.call(v) === '[object Date]';
  }
  removeComments(str: string) {
    return str.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim();
  }
  annotateFunction(str: Function) {
    const parts = this.removeComments(str.toString()).split('').reverse();
    const processed: string[] = [];
    let curr: unknown;
    let bracketsOpen = 0;
    let bracketsClosed = 0;
    let openCount = 0;
    let closedCount = 0;
    let result: unknown;

    while ((curr = !result && parts.pop())) {
      if (curr === '(') {
        openCount += 1;
      } else if (curr === ')') {
        closedCount += 1;
      }
      if (openCount > 0) {
        processed.push(curr as string);
        if (curr === '{') {
          bracketsOpen += 1;
        } else if (curr === '}') {
          bracketsClosed += 1;
        }
      }
      result =
        result ||
        (bracketsOpen === bracketsClosed &&
          openCount === closedCount &&
          openCount > 0)
          ? processed.join('')
          : undefined;
    }

    return result
      ? 'function'.concat(result as string).concat('{}')
      : this.annotateFn2(str);
  }

  annotateFn2(fn: Function) {
    const name = fn.name || fn.toString() || '';
    const len = fn.length || 0;
    let idx = 0;
    let list;
    list = new Array(len);
    while (idx < len) {
      list[idx] = `arg{idx}`;
      idx += 1;
    }
    return 'function ' + name + '(' + list.join(', ') + ') {}';
  }

  stringify(obj: any): string {
    if (this.isBoolean(obj)) {
      return obj.toString();
    } else if (obj === undefined) {
      return 'undefined';
    } else if (obj === null) {
      return 'null';
    } else if (this.isNumber(obj)) {
      return obj.toString();
    } else if (this.isString(obj)) {
      return this.maxStringLength && obj.length > this.maxStringLength
        ? this.tryStringify(obj.substring(0, 100).concat('...'))
        : this.tryStringify(obj);
    } else if (this.isWindowNode(obj)) {
      return this.tryStringify(obj);
    } else if (this.isFunction(obj)) {
      return this.verboseFunctions
        ? obj
            .toString()
            .replace(/{\s\[native code\]\s}/g, '{}')
            .split('\n')
            .map((line: string) => line.split('// ').reverse().pop())
            .join('\n')
        : this.annotateFunction(obj);
    } else if (this.isDate(obj)) {
      return this.tryStringify(obj);
    } else if (this.isArray(obj)) {
      if (this.seen.indexOf(obj) >= 0) {
        return this.circular;
      } else {
        this.seen.push(obj);
        return `[${obj.map(this.stringify).join(', ')}]`;
      }
    } else {
      if (this.seen.indexOf(obj) >= 0) {
        return this.circular;
      } else {
        this.seen.push(obj);

        const pairs: string[] = [];

        for (let key in obj) {
          if (
            obj &&
            obj.hasOwnProperty &&
            this.isFunction(obj.hasOwnProperty) &&
            obj.hasOwnProperty(key)
          ) {
            let pair = key + ': ';
            pair += this.stringify(obj[key]);
            pairs.push(pair);
          }
        }
        return `{ ${pairs.join(', ')} }`;
      }
    }
  }

  serialize() {
    const it = this.thing;
    if (!this.isWindow(it)) {
      return this.stringify(it);
    }
    if (this.seen.indexOf(it) >= 0) {
      return this.circular;
    } else {
      this.seen.push(it);
    }

    let sessionStorageMock: any = {
      sessionStorage: () => ({
        getItem: function (key: any) {
          return key;
        },
        setItem: function (_key: any, val: any) {
          return val;
        },
      }),
      localStorage: () => ({
        getItem: function (key: any) {
          return key;
        },
        setItem: function (_key: any, val: any) {
          return val;
        },
      }),
    };

    const res = Object.keys(it).reduce((pairs: string[], key) => {
      const value = sessionStorageMock[key]
        ? this.stringify(sessionStorageMock[key])
        : this.isWindow(it[key])
        ? this.circular
        : this.stringify(it[key]);

      pairs.push(`${key}: ${value}`);

      return pairs;
    }, []);
    return `{ ${res.join(', ')} }`;
  }

  tryStringify<T>(it: T): string {
    let result: string;
    try {
      result = JSON.stringify(it);
    } catch (error) {
      result = JSON.stringify(error.message || error);
    }
    return result;
  }
}

export const serializeCode = (
  thing: any,
  verboseFunctions?: boolean,
  maxStringLength?: number
) =>
  Serialize.makeSerialize({
    thing,
    verboseFunctions,
    maxStringLength,
  }).serialize();
