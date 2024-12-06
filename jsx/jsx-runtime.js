// jsx-runtime.mjs
(() => {
  if (typeof Symbol.toHtmlTag === "symbol")
    return;
  Object.defineProperty(Symbol, "toHtmlTag", {
    value: Symbol("toHtmlTag"),
    enumerable: false,
    configurable: true
  });
})();
var mapChildren = (children, accumulator) => {
  switch (typeof children) {
    case "string":
      accumulator.push({ type: "textNode", text: children });
      break;
    case "number":
      accumulator.push({ type: "textNode", text: children.toString() });
      break;
    case "object":
      if (Array.isArray(children)) {
        for (let i = 0;i < children.length; i++) {
          const child = children[i];
          mapChildren(child, accumulator);
        }
      } else if (children != null) {
        if (Symbol.toHtmlTag in children && typeof children[Symbol.toHtmlTag] === "function") {
          const html = String(children[Symbol.toHtmlTag]());
          accumulator.push({ type: "textNode", text: html });
        } else {
          accumulator.push(children);
        }
      }
      break;
  }
  return accumulator;
};
var createElement = (tag, props, ...children) => {
  props ?? (props = {});
  const finalChildren = [];
  for (let i = 0;i < children.length; i++) {
    mapChildren(children[i], finalChildren);
  }
  if (props?.children) {
    mapChildren(props.children, finalChildren);
  }
  props.children = finalChildren;
  Object.freeze(finalChildren);
  Object.freeze(props);
  return {
    type: "tag",
    tag,
    props
  };
};
var jsx = createElement;
var jsxs = jsx;
var Fragment = "";

// ../jsxte-render-error.mjs
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => (key in obj) ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var mapReverse = (arr, fn) => {
  const result = [];
  for (let i = arr.length - 1;i >= 0; i--) {
    result.push(fn(arr[i]));
  }
  return result;
};
var JsxteRenderError = class _JsxteRenderError extends Error {
  constructor(message, insideTag, causedBy) {
    super(message, { cause: causedBy });
    __publicField(this, "baseMessage", "");
    __publicField(this, "parentTags", []);
    this.name = "JsxteRenderError";
    this.baseMessage = message;
    if (insideTag) {
      this.parentTags.push(insideTag);
    }
    if (this.cause == null) {
      Object.defineProperty(this, "cause", {
        value: causedBy,
        enumerable: true,
        writable: true
      });
    }
  }
  static is(err) {
    return err instanceof _JsxteRenderError;
  }
  pushParent(tag) {
    this.parentTags.push(tag);
  }
  regenerateMessage() {
    this.message = `The below error has occurred in:
${mapReverse(this.parentTags.filter((t) => t !== ""), (tag) => `<${tag}>`).join("\n")}

${this.baseMessage}`;
  }
};

// ../dom-renderer/dom-renderer.mjs
var __defProp2 = Object.defineProperty;
var __defNormalProp2 = (obj, key, value) => (key in obj) ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField2 = (obj, key, value) => {
  __defNormalProp2(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var DomRenderer = class {
  constructor(window, options = {}) {
    this.window = window;
    this.options = options;
    __publicField2(this, "generator");
    __publicField2(this, "setAttribute", (element, name, value) => {
      if (typeof value === "boolean") {
        if (value) {
          value = name;
        } else {
          return;
        }
      }
      element.setAttribute(name, value);
    });
    if (options.attributeSetter) {
      this.setAttribute = options.attributeSetter;
    }
    const doc = this.window.document;
    const domrenderer = this;

    class DomGenerator {
      createElement(type, attributes, children) {
        const element = doc.createElement(type);
        for (const [name, value] of attributes) {
          domrenderer.setAttribute(element, name, value);
        }
        for (const child of children) {
          element.appendChild(child);
        }
        return element;
      }
      createTextNode(text) {
        return doc.createTextNode(String(text));
      }
      createFragment(children) {
        const fragment = doc.createDocumentFragment();
        for (const child of children) {
          fragment.appendChild(child);
        }
        return fragment;
      }
    }
    this.generator = new DomGenerator;
  }
  render(component, componentApi) {
    const renderer = new JsxteRenderer(this.generator, {
      ...this.options,
      allowAsync: false
    }, componentApi);
    return renderer.render(component);
  }
  async renderAsync(component, componentApi) {
    const renderer = new JsxteRenderer(this.generator, {
      ...this.options,
      allowAsync: true
    }, componentApi);
    return renderer.render(component);
  }
};

// ../utilities/join.mjs
function join(arr, separator = "\n") {
  let result = arr[0] ?? "";
  const until = arr.length;
  for (let i = 1;i < until; i++) {
    result += separator + arr[i];
  }
  return result;
}

// ../html-renderer/attribute-to-html-tag-string.mjs
var attributeToHtmlTagString = ([key, value]) => {
  if (value === true) {
    return `${key}`;
  }
  if (value === false || value === null || value === undefined) {
    return "";
  }
  return `${key}="${value.toString().replace(/"/g, "&quot;")}"`;
};
var mapAttributesToHtmlTagString = (attributes) => {
  const results = [];
  for (let i = 0;i < attributes.length; i++) {
    const attribute = attributes[i];
    const html = attributeToHtmlTagString(attribute);
    if (html.length > 0)
      results.push(html);
  }
  return join(results, " ");
};

// ../utilities/self-closing-tag-list.mjs
var SELF_CLOSING_TAG_LIST = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr"
];

// ../html-renderer/base-html-generator.mjs
var BaseHtmlGenerator = class _BaseHtmlGenerator {
  constructor(options) {
    this.options = options;
  }
  generateTagCompact(tag, attributes, content) {
    if (attributes) {
      attributes = " " + attributes;
    } else {
      attributes = "";
    }
    if (!content || content.length === 0) {
      if (SELF_CLOSING_TAG_LIST.includes(tag)) {
        return `<${tag}${attributes} />`;
      } else {
        return `<${tag}${attributes}></${tag}>`;
      }
    }
    return `<${tag}${attributes}>${content}</${tag}>`;
  }
  flattenChildrenCompact(children) {
    return join(children, "");
  }
  generateTag(tag, attributes, content) {
    if (attributes) {
      attributes = " " + attributes;
    } else {
      attributes = "";
    }
    if (!content || content.length === 0) {
      if (SELF_CLOSING_TAG_LIST.includes(tag)) {
        return [{
          type: "tag-selfclose",
          tag,
          content: `<${tag}${attributes} />`
        }];
      } else {
        return [{
          type: "tag-inline",
          tag,
          content: `<${tag}${attributes}></${tag}>`
        }];
      }
    }
    return [
      {
        type: "tag-open",
        tag,
        content: `<${tag}${attributes}>`
      },
      ...content,
      {
        type: "tag-close",
        tag,
        content: `</${tag}>`
      }
    ];
  }
  flattenChildren(children) {
    const result = [];
    for (let i = 0;i < children.length; i++) {
      const child = children[i];
      if (child.length === 1 && child[0].type === "text") {
        const last = result.at(-1);
        if (last?.type === "text") {
          last.content += child[0].content;
          continue;
        }
      }
      const lasIdx = result.length;
      for (let j = 0;j < child.length; j++) {
        result[lasIdx + j] = child[j];
      }
    }
    return result;
  }
  static leftPad(str, pad) {
    if (!str.includes("\n")) {
      return pad + str;
    } else {
      const lines = str.split("\n");
      for (let i = 0;i < lines.length; i++) {
        lines[i] = pad + lines[i];
      }
      return join(lines);
    }
  }
  static trimContent(content) {
    let leftWhitespace = 0;
    let rightWhitespace = 0;
    let wsLeft = false;
    let wsRight = false;
    for (let i = 0;i < content.length; i++) {
      if (content[i] === " " || content[i] === "\n") {
        leftWhitespace += 1;
      } else {
        break;
      }
    }
    if (leftWhitespace === content.length) {
      return { wsLeft: true, wsRight: true, trimmed: "" };
    }
    if (leftWhitespace > 0) {
      content = content.substring(leftWhitespace);
      wsLeft = true;
    }
    for (let i = content.length - 1;i >= 0; i--) {
      if (content[i] === " " || content[i] === "\n") {
        rightWhitespace += 1;
      } else {
        break;
      }
    }
    if (rightWhitespace > 0) {
      content = content.substring(0, content.length - rightWhitespace);
      wsRight = true;
    }
    return { wsLeft, wsRight, trimmed: content };
  }
  static concatHtmlLines(lines, options) {
    let result = "";
    const indentLength = options?.indent ?? 2;
    const singleIndent = " ".repeat(indentLength);
    let currentIndent = "";
    let inPre = 0;
    for (let i = 0;i < lines.length; i++) {
      const line = lines[i];
      if (inPre > 0) {
        const isLast = lines[i + 1]?.type === "tag-close" && lines[i + 1]?.tag === "pre";
        const suffix = isLast ? "" : "\n";
        switch (line.type) {
          case "tag-open":
            if (line.tag === "pre") {
              inPre += 1;
            }
            result += line.content + suffix;
            currentIndent += singleIndent;
            break;
          case "tag-close":
            if (line.tag === "pre") {
              inPre -= 1;
            }
            result += line.content + suffix;
            currentIndent = currentIndent.substring(indentLength);
            break;
          case "tag-inline":
            result += line.content + suffix;
            break;
          case "tag-selfclose":
            result += line.content + suffix;
            break;
          case "text":
            result += line.content + suffix;
            break;
        }
      } else {
        switch (line.type) {
          case "tag-open": {
            let suffix = "\n";
            if (line.tag === "pre") {
              inPre += 1;
              suffix = "";
            } else {
              const nextLine = lines[i + 1];
              const addNewLine = nextLine ? nextLine.type === "tag-open" || nextLine.type === "tag-selfclose" : true;
              if (!addNewLine) {
                suffix = "";
              } else if (result.length && result.at(-1) !== "\n") {
                result += "\n";
              }
            }
            const addIndent = result.at(-1) === "\n";
            if (addIndent) {
              result += currentIndent + line.content + suffix;
            } else {
              result += line.content + suffix;
            }
            currentIndent += singleIndent;
            break;
          }
          case "tag-close": {
            currentIndent = currentIndent.substring(indentLength);
            const nextLine = lines[i + 1];
            const addIndent = result.at(-1) === "\n";
            const addNewLine = nextLine ? nextLine.type === "tag-close" || nextLine.type === "tag-selfclose" : true;
            if (addIndent) {
              result += currentIndent;
            }
            result += line.content;
            if (addNewLine) {
              result += "\n";
            }
            break;
          }
          case "tag-inline": {
            const nextLine = lines[i + 1];
            const addIndent = result.at(-1) === "\n";
            const addNewLine = nextLine ? nextLine.type !== "text" : true;
            if (addIndent) {
              result += currentIndent;
            }
            result += line.content;
            if (addNewLine) {
              result += "\n";
            }
            break;
          }
          case "tag-selfclose": {
            result += currentIndent + line.content + "\n";
            break;
          }
          case "text": {
            const content = _BaseHtmlGenerator.trimContent(line.content);
            const nextLine = lines[i + 1];
            const addIndent = result.at(-1) === "\n";
            if (addIndent) {
              result += _BaseHtmlGenerator.leftPad(content.trimmed, currentIndent);
            } else {
              if (content.wsLeft && content.trimmed !== "") {
                result += "\n" + _BaseHtmlGenerator.leftPad(content.trimmed, currentIndent);
              } else {
                result += content.trimmed;
              }
            }
            if (content.wsRight && nextLine?.type !== "tag-close") {
              result += "\n";
            }
            break;
          }
        }
      }
    }
    return result;
  }
};

// ../html-renderer/jsx-elem-to-html-sync.mjs
var HtmlCompactGenerator = class extends BaseHtmlGenerator {
  createTextNode(text) {
    return String(text);
  }
  createElement(type, attributes, children) {
    const attributesString = mapAttributesToHtmlTagString(attributes);
    const content = this.flattenChildrenCompact(children);
    return this.generateTagCompact(type, attributesString, content);
  }
  createFragment(children) {
    return this.flattenChildrenCompact(children);
  }
};
var HtmlPrettyGenerator = class extends BaseHtmlGenerator {
  createTextNode(text) {
    return [{ type: "text", content: String(text) }];
  }
  createElement(type, attributes, children) {
    const attributesString = mapAttributesToHtmlTagString(attributes);
    const content = this.flattenChildren(children);
    return this.generateTag(type, attributesString, content);
  }
  createFragment(children) {
    return this.flattenChildren(children);
  }
};
var jsxElemToHtmlSync = (element, componentApi, options = {}) => {
  const { pretty = false } = options;
  if (pretty) {
    const renderer = new JsxteRenderer(new HtmlPrettyGenerator(options), { ...options, allowAsync: false }, componentApi);
    const lines = renderer.render(element);
    return HtmlPrettyGenerator.concatHtmlLines(lines, options);
  } else {
    const renderer = new JsxteRenderer(new HtmlCompactGenerator(options), { ...options, allowAsync: false }, componentApi);
    return renderer.render(element);
  }
};

// ../json-renderer/jsx-elem-to-json.mjs
var JsonGenerator = class {
  createTextNode(text) {
    return text;
  }
  createElement(type, attributes, children) {
    return {
      element: type,
      attributes,
      children
    };
  }
  createFragment(children) {
    return {
      element: "",
      attributes: [],
      children
    };
  }
};
var jsxElemToJsonSync = (element, componentApi, options) => {
  const renderer = new JsxteRenderer(new JsonGenerator, { ...options, allowAsync: false }, componentApi);
  return renderer.render(element);
};
var AsyncJsonGenerator = class {
  createTextNode(text) {
    return text;
  }
  async createElement(type, attributes, children) {
    return {
      element: type,
      attributes,
      children: await Promise.resolve(children).then((c) => Promise.all(c))
    };
  }
  async createFragment(children) {
    return {
      element: "",
      attributes: [],
      children: await Promise.resolve(children).then((c) => Promise.all(c))
    };
  }
};
var jsxElemToJsonAsync = (element, componentApi, options) => {
  const renderer = new JsxteRenderer(new AsyncJsonGenerator, { ...options, allowAsync: true }, componentApi);
  return renderer.render(element);
};

// ../component-api/component-api.mjs
var __defProp3 = Object.defineProperty;
var __defNormalProp3 = (obj, key, value) => (key in obj) ? __defProp3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField3 = (obj, key, value) => {
  __defNormalProp3(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var ContextAccessor = class _ContextAccessor {
  constructor(map = /* @__PURE__ */ new Map) {
    this.map = map;
  }
  static clone(original) {
    return new _ContextAccessor(new Map(original.map));
  }
  getOrFail(ref) {
    const value = this.map.get(ref.id);
    if (value === undefined) {
      throw new Error("Context not defined! Make sure the context is set before accessing it.");
    }
    return value;
  }
  get(ref) {
    const value = this.map.get(ref.id);
    return value;
  }
  update(ref, updateData) {
    const data = this.get(ref);
    if (typeof data === "object" && data !== null && typeof updateData === "object" && updateData !== null) {
      if (Array.isArray(data)) {
        const arr = Array.from(data);
        const entries = Object.entries(updateData);
        for (let i = 0;i < entries.length; i++) {
          const [key, value] = entries[i];
          const index = Number(key);
          if (!isNaN(index))
            arr[index] = value;
        }
        return void this.map.set(ref.id, arr);
      } else {
        return void this.map.set(ref.id, { ...data, ...updateData });
      }
    } else {
      throw new Error("Context data is not an object!. Partial updates are only possible for objects.");
    }
  }
  set(ref, data) {
    this.map.set(ref.id, data);
  }
  has(ref) {
    return this.map.has(ref.id);
  }
  replace(context) {
    this.map = context.map;
  }
};
var ComponentApi = class _ComponentApi {
  constructor(options, accessor) {
    this.options = options;
    __publicField3(this, "ctx");
    this.ctx = accessor ?? new ContextAccessor;
  }
  static create(options) {
    return new _ComponentApi(options);
  }
  static clone(original) {
    return new _ComponentApi(original.options, ContextAccessor.clone(original.ctx));
  }
  render(component, optionsOverrides) {
    const thisCopy = _ComponentApi.clone(this);
    if (optionsOverrides) {
      return jsxElemToHtmlSync(component, thisCopy, {
        ...this.options,
        ...optionsOverrides
      });
    }
    return jsxElemToHtmlSync(component, thisCopy, this.options);
  }
  async renderAsync(component, optionsOverrides) {
    const thisCopy = _ComponentApi.clone(this);
    if (optionsOverrides) {
      return Promise.resolve(component).then((c) => jsxElemToHtmlAsync(c, thisCopy, {
        ...this.options,
        ...optionsOverrides
      }));
    }
    return Promise.resolve(component).then((c) => jsxElemToHtmlAsync(c, thisCopy, this.options));
  }
  renderToJson(component, optionsOverrides) {
    const thisCopy = _ComponentApi.clone(this);
    if (optionsOverrides) {
      return jsxElemToJsonSync(component, thisCopy, {
        ...this.options,
        ...optionsOverrides
      });
    }
    return jsxElemToJsonSync(component, thisCopy, this.options);
  }
  async renderToJsonAsync(component, optionsOverrides) {
    const thisCopy = _ComponentApi.clone(this);
    if (optionsOverrides) {
      return Promise.resolve(component).then((c) => jsxElemToJsonAsync(c, thisCopy, {
        ...this.options,
        ...optionsOverrides
      }));
    }
    return Promise.resolve(component).then((c) => jsxElemToJsonAsync(c, thisCopy, this.options));
  }
  renderToDom(window, component, optionsOverrides) {
    const thisCopy = _ComponentApi.clone(this);
    if (optionsOverrides) {
      const r2 = new DomRenderer(window, {
        ...this.options,
        ...optionsOverrides
      });
      return r2.render(component, thisCopy);
    }
    const r = new DomRenderer(window, this.options);
    return r.render(component, thisCopy);
  }
  async renderToDomAsync(window, component, optionsOverrides) {
    const thisCopy = _ComponentApi.clone(this);
    if (optionsOverrides) {
      const r2 = new DomRenderer(window, {
        ...this.options,
        ...optionsOverrides
      });
      return Promise.resolve(component).then((c) => r2.renderAsync(c, thisCopy));
    }
    const r = new DomRenderer(window, this.options);
    return Promise.resolve(component).then((c) => r.renderAsync(c, thisCopy));
  }
};

// ../error-boundary/error-boundary.mjs
var __defProp4 = Object.defineProperty;
var __defNormalProp4 = (obj, key, value) => (key in obj) ? __defProp4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField4 = (obj, key, value) => {
  __defNormalProp4(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var ErrorBoundary = class {
  static _isErrorBoundary(o) {
    const canBeClass = typeof o === "function";
    const isNotNull = o !== null;
    if (!canBeClass || !isNotNull)
      return false;
    const baseName = o._baseName;
    return baseName === this._baseName;
  }
  constructor(_) {
  }
};
__publicField4(ErrorBoundary, "_baseName", "ErrorBoundary");

// ../utilities/get-component-name.mjs
var getComponentName = (element) => {
  if (typeof element.tag === "string") {
    return element.tag;
  }
  if ("displayName" in element.tag && typeof element.tag.displayName === "string") {
    return element.tag.displayName;
  }
  if ("name" in element.tag && typeof element.tag.name === "string") {
    return element.tag.name;
  }
  return "AnonymousComponent";
};

// ../utilities/get-err-message.mjs
var getErrorMessage = (err) => {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === "string") {
    return err;
  }
  return String(err);
};

// ../renderer/renderer.mjs
function isTagElement(element) {
  return typeof element === "object" && element !== null && "type" in element && element.type === "tag";
}
function isErrorBoundaryElement(element) {
  return typeof element.tag === "function" && ErrorBoundary._isErrorBoundary(element.tag);
}
function isPromiseLike(obj) {
  return obj instanceof Promise || typeof obj === "object" && obj !== null && typeof obj.then === "function" && typeof obj.catch === "function";
}
function asyncError() {
  throw new JsxteRenderError("Encountered an async Component: Asynchronous Component's cannot be parsed by this renderer.");
}
var __defProp5 = Object.defineProperty;
var __defNormalProp5 = (obj, key, value) => (key in obj) ? __defProp5(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField5 = (obj, key, value) => {
  __defNormalProp5(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var NIL = Symbol("NIL");
var ElementMatcher = class {
  constructor(options) {
    this.options = options;
    __publicField5(this, "stringTagHandler");
    __publicField5(this, "functionTagHandler");
    __publicField5(this, "classTagHandler");
    __publicField5(this, "fragmentHandler");
    __publicField5(this, "textHandler");
    __publicField5(this, "primitiveHandler");
    __publicField5(this, "handleError");
  }
  matchSyncElem(element, context) {
    switch (typeof element) {
      case "string":
      case "bigint":
      case "number":
        return this.primitiveHandler(element, context, element);
      case "boolean":
      case "function":
      case "symbol":
      case "undefined":
        return NIL;
    }
    if (element === null) {
      return NIL;
    }
    if (element.type === "textNode") {
      return this.textHandler(element, context, element);
    }
    if (element.type === "tag") {
      if (typeof element.tag === "string") {
        if (element.tag === "") {
          return this.fragmentHandler(element.props.children, context, element);
        }
        return this.stringTagHandler({
          tag: element.tag,
          props: element.props
        }, context, element);
      }
      if (typeof element.tag === "function") {
        if (ErrorBoundary._isErrorBoundary(element.tag)) {
          return this.classTagHandler({
            classComponent: element.tag,
            props: element.props
          }, context, element);
        } else {
          return this.functionTagHandler({
            funcComponent: element.tag,
            props: element.props
          }, context, element);
        }
      }
    }
    return NIL;
  }
  createHandler(func) {
    return (...args) => {
      try {
        const result = func.apply(null, args);
        if (isPromiseLike(result)) {
          return result.catch((err) => {
            return this.handleError(err, args[2], args[1]);
          });
        }
        return result;
      } catch (err) {
        return this.handleError(err, args[2], args[1]);
      }
    };
  }
  functionTag(on) {
    this.functionTagHandler = this.createHandler(on);
    return this;
  }
  classTag(on) {
    this.classTagHandler = this.createHandler(on);
    return this;
  }
  stringTag(on) {
    this.stringTagHandler = this.createHandler(on);
    return this;
  }
  fragment(on) {
    this.fragmentHandler = this.createHandler(on);
    return this;
  }
  text(on) {
    this.textHandler = this.createHandler(on);
    return this;
  }
  primitive(on) {
    this.primitiveHandler = this.createHandler(on);
    return this;
  }
  onError(on) {
    this.handleError = on;
    return this;
  }
  match(element, context) {
    if (isPromiseLike(element)) {
      if (this.options.allowAsync === false) {
        asyncError();
      }
      return element.then((element2) => {
        return this.matchSyncElem(element2, {
          componentApi: ComponentApi.clone(context.componentApi)
        });
      });
    }
    return this.matchSyncElem(element, {
      componentApi: ComponentApi.clone(context.componentApi)
    });
  }
  matchMap(elements, mapFn) {
    const results = [];
    const awaits = [];
    for (let i = 0;i < elements.length; i++) {
      const element = elements[i];
      const r = mapFn(element, (element2, context) => this.match(element2, context));
      if (isPromiseLike(r)) {
        if (this.options.allowAsync === false) {
          asyncError();
        }
        awaits.push(r.then((result) => {
          if (result !== NIL) {
            results[i] = result;
          }
        }));
      } else if (r !== NIL) {
        results[i] = r;
      }
    }
    if (awaits.length === 0) {
      return results;
    }
    return Promise.all(awaits).then(() => {
      return results;
    });
  }
};
var JsxteRenderer = class {
  constructor(generator, options = { allowAsync: false }, rootComponentApi = ComponentApi.create(options)) {
    this.generator = generator;
    this.options = options;
    this.rootComponentApi = rootComponentApi;
    __publicField5(this, "matcher");
    this.matcher = new ElementMatcher(options);
    const renderer = this;
    this.matcher.functionTag((tagElement, context) => {
      const elem = tagElement.funcComponent(tagElement.props, context.componentApi);
      return renderer.renderChild(elem, context);
    }).classTag((tagElement, context) => {
      const compoentInstance = new tagElement.classComponent(tagElement.props);
      const elem = compoentInstance.render(tagElement.props, context.componentApi);
      return renderer.renderChild(elem, context);
    }).stringTag((tagElement, context) => {
      const { attributes, children } = this.resolveProps(tagElement.props);
      const renderedChildren = this.matcher.matchMap(children, (child, next) => next(child, {
        componentApi: ComponentApi.clone(context.componentApi)
      }));
      return this.generator.createElement(tagElement.tag, attributes, renderedChildren);
    }).fragment((fragmentElement, context) => {
      const childrenArray = Array.isArray(fragmentElement) ? fragmentElement.flat(1) : [fragmentElement];
      const renderedChildren = this.matcher.matchMap(childrenArray, (child, next) => next(child, {
        componentApi: ComponentApi.clone(context.componentApi)
      }));
      return this.generator.createFragment(renderedChildren);
    }).text((textNode) => {
      return this.generator.createTextNode(textNode.text);
    }).primitive((primitive) => {
      return this.generator.createTextNode(primitive);
    }).onError((err, element, context) => {
      if (!isTagElement(element)) {
        throw err;
      }
      if (isErrorBoundaryElement(element)) {
        return this.renderChild({
          type: "tag",
          tag: function ErrorHandler() {
            const component = new element.tag(element.props);
            return component.onError(err, element.props, context.componentApi);
          },
          props: {}
        }, context);
      }
      if (!JsxteRenderError.is(err)) {
        throw new JsxteRenderError("Rendering has failed due to an error: " + getErrorMessage(err), getComponentName(element));
      }
      err.pushParent(getComponentName(element));
      throw err;
    });
  }
  mapAttributeName(attributeName) {
    if (this.options.attributeMap && attributeName in this.options.attributeMap) {
      return this.options.attributeMap[attributeName];
    }
    return attributeName;
  }
  resolveProps({
    children,
    ...props
  }) {
    const rprops = {
      attributes: [],
      children: []
    };
    if (children) {
      if (Array.isArray(children)) {
        rprops.children = children.flat(1);
      } else {
        rprops.children = [children];
      }
    }
    const entries = Object.entries(props);
    for (let i = 0;i < entries.length; i++) {
      const [name, value] = entries[i];
      rprops.attributes.push([this.mapAttributeName(name), value]);
    }
    return rprops;
  }
  renderChild(element, context) {
    if (element === null) {
      return NIL;
    }
    return this.matcher.match(element, context);
  }
  render(element) {
    const result = this.renderChild(element, {
      componentApi: this.rootComponentApi
    });
    if (result === NIL) {
      return this.generator.createTextNode("");
    }
    if (isPromiseLike(result)) {
      return result.then((result2) => {
        if (result2 === NIL) {
          return this.generator.createTextNode("");
        }
        return result2;
      });
    }
    return result;
  }
};

// ../html-renderer/jsx-elem-to-html-async.mjs
var AsyncHtmlCompactGenerator = class extends BaseHtmlGenerator {
  createElement(type, attributes, children) {
    return Promise.resolve(children).then((c) => Promise.all(c)).then((children2) => {
      const attributesString = mapAttributesToHtmlTagString(attributes);
      const content = this.flattenChildrenCompact(children2);
      return this.generateTagCompact(type, attributesString, content);
    });
  }
  createTextNode(text) {
    return String(text);
  }
  createFragment(children) {
    return Promise.resolve(children).then((c) => Promise.all(c)).then((children2) => {
      return this.flattenChildrenCompact(children2);
    });
  }
};
var AsyncHtmlPrettyGenerator = class extends BaseHtmlGenerator {
  createElement(type, attributes, children) {
    return Promise.resolve(children).then((c) => Promise.all(c)).then((children2) => {
      const attributesString = mapAttributesToHtmlTagString(attributes);
      const content = this.flattenChildren(children2);
      return this.generateTag(type, attributesString, content);
    });
  }
  createTextNode(text) {
    return [{ type: "text", content: String(text) }];
  }
  createFragment(children) {
    return Promise.resolve(children).then((c) => Promise.all(c)).then((children2) => {
      return this.flattenChildren(children2);
    });
  }
};
var jsxElemToHtmlAsync = (element, componentApi, options = {}) => {
  const { pretty = false } = options;
  if (pretty) {
    const renderer = new JsxteRenderer(new AsyncHtmlPrettyGenerator(options), { ...options, allowAsync: true }, componentApi);
    const lines = renderer.render(element);
    return Promise.resolve(lines).then((lines2) => AsyncHtmlPrettyGenerator.concatHtmlLines(lines2, options));
  } else {
    const renderer = new JsxteRenderer(new AsyncHtmlCompactGenerator(options), { ...options, allowAsync: true }, componentApi);
    return Promise.resolve(renderer.render(element));
  }
};

// ../html-renderer/render-to-html.mjs
var renderToHtml = (component, options) => {
  try {
    return jsxElemToHtmlSync(component, undefined, options);
  } catch (err) {
    if (JsxteRenderError.is(err)) {
      err.regenerateMessage();
    }
    throw err;
  }
};
var renderToHtmlAsync = async (component, options) => {
  try {
    return await jsxElemToHtmlAsync(await component, undefined, options);
  } catch (err) {
    if (JsxteRenderError.is(err)) {
      err.regenerateMessage();
    }
    throw err;
  }
};

// jsx-dev-runtime.mjs
var jsxDEV = (tag, props) => {
  const { children, ...restProps } = props ?? {};
  if (Array.isArray(children)) {
    return jsx(tag, restProps, ...children);
  }
  return jsx(tag, restProps, children);
};
export {
  renderToHtmlAsync,
  renderToHtml,
  jsxs,
  jsxDEV,
  jsx,
  Fragment
};
