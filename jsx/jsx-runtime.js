// @bun
// jsx-runtime.ts
(() => {
  if (typeof Symbol.toHtmlTag === "symbol")
    return;
  Object.defineProperty(Symbol, "toHtmlTag", {
    value: Symbol("toHtmlTag"),
    enumerable: !1,
    configurable: !0
  });
})();
var Q = (r, g) => {
  switch (typeof r) {
    case "string":
      g.push({ type: "textNode", text: r });
      break;
    case "number":
      g.push({ type: "textNode", text: r.toString() });
      break;
    case "object":
      if (Array.isArray(r))
        for (let y = 0;y < r.length; y++) {
          const P = r[y];
          Q(P, g);
        }
      else if (r != null)
        if (Symbol.toHtmlTag in r && typeof r[Symbol.toHtmlTag] === "function") {
          const y = String(r[Symbol.toHtmlTag]());
          g.push({ type: "textNode", text: y });
        } else
          g.push(r);
      break;
  }
  return g;
}, v = (r, g, ...y) => {
  g ??= {};
  const P = [];
  for (let J = 0;J < y.length; J++)
    Q(y[J], P);
  if (g?.children)
    Q(g.children, P);
  return g.children = P, Object.freeze(P), Object.freeze(g), {
    type: "tag",
    tag: r,
    props: g
  };
}, R = v, u = R;
var x = "";

// ../jsxte-render-error.ts
var h = (r, g) => {
  const y = [];
  for (let P = r.length - 1;P >= 0; P--)
    y.push(g(r[P]));
  return y;
};

class $ extends Error {
  static is(r) {
    return r instanceof $;
  }
  baseMessage = "";
  parentTags = [];
  constructor(r, g, y) {
    super(r, { cause: y });
    if (this.name = "JsxteRenderError", this.baseMessage = r, g)
      this.parentTags.push(g);
    if (this.cause == null)
      Object.defineProperty(this, "cause", {
        value: y,
        enumerable: !0,
        writable: !0
      });
  }
  pushParent(r) {
    this.parentTags.push(r);
  }
  regenerateMessage() {
    this.message = `The below error has occurred in:\n${h(this.parentTags.filter((r) => r !== ""), (r) => `<${r}>`).join("\n")}\n\n${this.baseMessage}`;
  }
}

// ../dom-renderer/dom-renderer.ts
class U {
  r;
  g;
  generator;
  setAttribute = (r, g, y) => {
    if (typeof y === "boolean")
      if (y)
        y = g;
      else
        return;
    r.setAttribute(g, y);
  };
  constructor(r, g = {}) {
    this.window = r;
    this.options = g;
    if (g.attributeSetter)
      this.setAttribute = g.attributeSetter;
    const y = this.window.document, P = this;

    class J {
      createElement(b, S, H) {
        const T = y.createElement(b);
        for (let [X, s] of S)
          P.setAttribute(T, X, s);
        for (let X of H)
          T.appendChild(X);
        return T;
      }
      createTextNode(b) {
        return y.createTextNode(String(b));
      }
      createFragment(b) {
        const S = y.createDocumentFragment();
        for (let H of b)
          S.appendChild(H);
        return S;
      }
    }
    this.generator = new J;
  }
  render(r, g) {
    return new E(this.generator, {
      ...this.options,
      allowAsync: !1
    }, g).render(r);
  }
  async renderAsync(r, g) {
    return new E(this.generator, {
      ...this.options,
      allowAsync: !0
    }, g).render(r);
  }
}

// ../utilities/join.ts
function B(r, g = "\n") {
  let y = r[0] ?? "";
  const P = r.length;
  for (let J = 1;J < P; J++)
    y += g + r[J];
  return y;
}

// ../html-renderer/attribute-to-html-tag-string.ts
var m = ([r, g]) => {
  if (g === !0)
    return `${r}`;
  if (g === !1 || g === null || g === void 0)
    return "";
  return `${r}="${g.toString().replace(/"/g, "&quot;")}"`;
}, F = (r) => {
  const g = [];
  for (let y = 0;y < r.length; y++) {
    const P = r[y], J = m(P);
    if (J.length > 0)
      g.push(J);
  }
  return B(g, " ");
};

// ../utilities/self-closing-tag-list.ts
var Y = [
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

// ../html-renderer/base-html-generator.ts
class V {
  r;
  constructor(r) {
    this.options = r;
  }
  generateTagCompact(r, g, y) {
    if (g)
      g = " " + g;
    else
      g = "";
    if (!y || y.length === 0)
      if (Y.includes(r))
        return `<${r}${g} />`;
      else
        return `<${r}${g}></${r}>`;
    return `<${r}${g}>${y}</${r}>`;
  }
  flattenChildrenCompact(r) {
    return B(r, "");
  }
  generateTag(r, g, y) {
    if (g)
      g = " " + g;
    else
      g = "";
    if (!y || y.length === 0)
      if (Y.includes(r))
        return [{
          type: "tag-selfclose",
          tag: r,
          content: `<${r}${g} />`
        }];
      else
        return [{
          type: "tag-inline",
          tag: r,
          content: `<${r}${g}></${r}>`
        }];
    return [
      {
        type: "tag-open",
        tag: r,
        content: `<${r}${g}>`
      },
      ...y,
      {
        type: "tag-close",
        tag: r,
        content: `</${r}>`
      }
    ];
  }
  flattenChildren(r) {
    const g = [];
    for (let y = 0;y < r.length; y++) {
      const P = r[y];
      if (P.length === 1 && P[0].type === "text") {
        const b = g.at(-1);
        if (b?.type === "text") {
          b.content += P[0].content;
          continue;
        }
      }
      const J = g.length;
      for (let b = 0;b < P.length; b++)
        g[J + b] = P[b];
    }
    return g;
  }
  static leftPad(r, g) {
    if (!r.includes("\n"))
      return g + r;
    else {
      const y = r.split("\n");
      for (let P = 0;P < y.length; P++)
        y[P] = g + y[P];
      return B(y);
    }
  }
  static trimContent(r) {
    let g = 0, y = 0, P = !1, J = !1;
    for (let b = 0;b < r.length; b++)
      if (r[b] === " " || r[b] === "\n")
        g += 1;
      else
        break;
    if (g === r.length)
      return { wsLeft: !0, wsRight: !0, trimmed: "" };
    if (g > 0)
      r = r.substring(g), P = !0;
    for (let b = r.length - 1;b >= 0; b--)
      if (r[b] === " " || r[b] === "\n")
        y += 1;
      else
        break;
    if (y > 0)
      r = r.substring(0, r.length - y), J = !0;
    return { wsLeft: P, wsRight: J, trimmed: r };
  }
  static concatHtmlLines(r, g) {
    let y = "";
    const P = g?.indent ?? 2, J = " ".repeat(P);
    let b = "", S = 0;
    for (let H = 0;H < r.length; H++) {
      const T = r[H];
      if (S > 0) {
        const s = r[H + 1]?.type === "tag-close" && r[H + 1]?.tag === "pre" ? "" : "\n";
        switch (T.type) {
          case "tag-open":
            if (T.tag === "pre")
              S += 1;
            y += T.content + s, b += J;
            break;
          case "tag-close":
            if (T.tag === "pre")
              S -= 1;
            y += T.content + s, b = b.substring(P);
            break;
          case "tag-inline":
            y += T.content + s;
            break;
          case "tag-selfclose":
            y += T.content + s;
            break;
          case "text":
            y += T.content + s;
            break;
        }
      } else
        switch (T.type) {
          case "tag-open": {
            let X = "\n";
            if (T.tag === "pre")
              S += 1, X = "";
            else {
              const M = r[H + 1];
              if (!(M ? M.type === "tag-open" || M.type === "tag-selfclose" : !0))
                X = "";
              else if (y.length && y.at(-1) !== "\n")
                y += "\n";
            }
            if (y.at(-1) === "\n")
              y += b + T.content + X;
            else
              y += T.content + X;
            b += J;
            break;
          }
          case "tag-close": {
            b = b.substring(P);
            const X = r[H + 1], s = y.at(-1) === "\n", M = X ? X.type === "tag-close" || X.type === "tag-selfclose" : !0;
            if (s)
              y += b;
            if (y += T.content, M)
              y += "\n";
            break;
          }
          case "tag-inline": {
            const X = r[H + 1], s = y.at(-1) === "\n", M = X ? X.type !== "text" : !0;
            if (s)
              y += b;
            if (y += T.content, M)
              y += "\n";
            break;
          }
          case "tag-selfclose": {
            y += b + T.content + "\n";
            break;
          }
          case "text": {
            const X = V.trimContent(T.content), s = r[H + 1];
            if (y.at(-1) === "\n")
              y += V.leftPad(X.trimmed, b);
            else if (X.wsLeft && X.trimmed !== "")
              y += "\n" + V.leftPad(X.trimmed, b);
            else
              y += X.trimmed;
            if (X.wsRight && s?.type !== "tag-close")
              y += "\n";
            break;
          }
        }
    }
    return y;
  }
}

// ../html-renderer/jsx-elem-to-html-sync.ts
class a extends V {
  createTextNode(r) {
    return String(r);
  }
  createElement(r, g, y) {
    const P = F(g), J = this.flattenChildrenCompact(y);
    return this.generateTagCompact(r, P, J);
  }
  createFragment(r) {
    return this.flattenChildrenCompact(r);
  }
}

class Z extends V {
  createTextNode(r) {
    return [{ type: "text", content: String(r) }];
  }
  createElement(r, g, y) {
    const P = F(g), J = this.flattenChildren(y);
    return this.generateTag(r, P, J);
  }
  createFragment(r) {
    return this.flattenChildren(r);
  }
}
var _ = (r, g, y = {}) => {
  const { pretty: P = !1 } = y;
  if (P) {
    const b = new E(new Z(y), { ...y, allowAsync: !1 }, g).render(r);
    return Z.concatHtmlLines(b, y);
  } else
    return new E(new a(y), { ...y, allowAsync: !1 }, g).render(r);
};

// ../json-renderer/jsx-elem-to-json.ts
class L {
  createTextNode(r) {
    return r;
  }
  createElement(r, g, y) {
    return {
      element: r,
      attributes: g,
      children: y
    };
  }
  createFragment(r) {
    return {
      element: "",
      attributes: [],
      children: r
    };
  }
}
var G = (r, g, y) => {
  return new E(new L, { ...y, allowAsync: !1 }, g).render(r);
};

class D {
  createTextNode(r) {
    return r;
  }
  async createElement(r, g, y) {
    return {
      element: r,
      attributes: g,
      children: await Promise.resolve(y).then((P) => Promise.all(P))
    };
  }
  async createFragment(r) {
    return {
      element: "",
      attributes: [],
      children: await Promise.resolve(r).then((g) => Promise.all(g))
    };
  }
}
var w = (r, g, y) => {
  return new E(new D, { ...y, allowAsync: !0 }, g).render(r);
};

// ../component-api/component-api.ts
class q {
  r;
  static clone(r) {
    return new q(new Map(r.map));
  }
  constructor(r = /* @__PURE__ */ new Map) {
    this.map = r;
  }
  getOrFail(r) {
    const g = this.map.get(r.id);
    if (g === void 0)
      throw new Error("Context not defined! Make sure the context is set before accessing it.");
    return g;
  }
  get(r) {
    return this.map.get(r.id);
  }
  update(r, g) {
    const y = this.get(r);
    if (typeof y === "object" && y !== null && typeof g === "object" && g !== null)
      if (Array.isArray(y)) {
        const P = Array.from(y), J = Object.entries(g);
        for (let b = 0;b < J.length; b++) {
          const [S, H] = J[b], T = Number(S);
          if (!isNaN(T))
            P[T] = H;
        }
        return void this.map.set(r.id, P);
      } else
        return void this.map.set(r.id, { ...y, ...g });
    else
      throw new Error("Context data is not an object!. Partial updates are only possible for objects.");
  }
  set(r, g) {
    this.map.set(r.id, g);
  }
  has(r) {
    return this.map.has(r.id);
  }
  replace(r) {
    this.map = r.map;
  }
}

class f {
  r;
  static create(r) {
    return new f(r);
  }
  static clone(r) {
    return new f(r.options, q.clone(r.ctx));
  }
  ctx;
  constructor(r, g) {
    this.options = r;
    this.ctx = g ?? new q;
  }
  render(r, g) {
    const y = f.clone(this);
    if (g)
      return _(r, y, {
        ...this.options,
        ...g
      });
    return _(r, y, this.options);
  }
  async renderAsync(r, g) {
    const y = f.clone(this);
    if (g)
      return Promise.resolve(r).then((P) => k(P, y, {
        ...this.options,
        ...g
      }));
    return Promise.resolve(r).then((P) => k(P, y, this.options));
  }
  renderToJson(r, g) {
    const y = f.clone(this);
    if (g)
      return G(r, y, {
        ...this.options,
        ...g
      });
    return G(r, y, this.options);
  }
  async renderToJsonAsync(r, g) {
    const y = f.clone(this);
    if (g)
      return Promise.resolve(r).then((P) => w(P, y, {
        ...this.options,
        ...g
      }));
    return Promise.resolve(r).then((P) => w(P, y, this.options));
  }
  renderToDom(r, g, y) {
    const P = f.clone(this);
    if (y)
      return new U(r, {
        ...this.options,
        ...y
      }).render(g, P);
    return new U(r, this.options).render(g, P);
  }
  async renderToDomAsync(r, g, y) {
    const P = f.clone(this);
    if (y) {
      const b = new U(r, {
        ...this.options,
        ...y
      });
      return Promise.resolve(g).then((S) => b.renderAsync(S, P));
    }
    const J = new U(r, this.options);
    return Promise.resolve(g).then((b) => J.renderAsync(b, P));
  }
}

class p {
  id = Symbol();
  Provider = (r, g) => {
    return g.ctx.set(this, r.value), R("", { children: r.children });
  };
  Consumer = (r, g) => {
    const y = g.ctx.get(this);
    return r.render(y);
  };
}

// ../error-boundary/error-boundary.ts
class z {
  static _isErrorBoundary(r) {
    if (typeof r !== "function" || r === null)
      return !1;
    return r._baseName === this._baseName;
  }
  static _baseName = "ErrorBoundary";
  constructor(r) {
  }
}

// ../utilities/get-component-name.ts
var W = (r) => {
  if (typeof r.tag === "string")
    return r.tag;
  if ("displayName" in r.tag && typeof r.tag.displayName === "string")
    return r.tag.displayName;
  if ("name" in r.tag && typeof r.tag.name === "string")
    return r.tag.name;
  return "AnonymousComponent";
};

// ../utilities/get-err-message.ts
var C = (r) => {
  if (r instanceof Error)
    return r.message;
  if (typeof r === "string")
    return r;
  return String(r);
};

// ../renderer/renderer.ts
function i(r) {
  return typeof r === "object" && r !== null && "type" in r && r.type === "tag";
}
function d(r) {
  return typeof r.tag === "function" && z._isErrorBoundary(r.tag);
}
function K(r) {
  return r instanceof Promise || typeof r === "object" && r !== null && typeof r.then === "function" && typeof r.catch === "function";
}
function O() {
  throw new $("Encountered an async Component: Asynchronous Component's cannot be parsed by this renderer.");
}
var N = Symbol("NIL");

class j {
  r;
  stringTagHandler;
  functionTagHandler;
  classTagHandler;
  fragmentHandler;
  textHandler;
  primitiveHandler;
  handleError;
  constructor(r) {
    this.options = r;
  }
  matchSyncElem(r, g) {
    switch (typeof r) {
      case "string":
      case "bigint":
      case "number":
        return this.primitiveHandler(r, g, r);
      case "boolean":
      case "function":
      case "symbol":
      case "undefined":
        return N;
    }
    if (r === null)
      return N;
    if (r.type === "textNode")
      return this.textHandler(r, g, r);
    if (r.type === "tag") {
      if (typeof r.tag === "string") {
        if (r.tag === "")
          return this.fragmentHandler(r.props.children, g, r);
        return this.stringTagHandler({
          tag: r.tag,
          props: r.props
        }, g, r);
      }
      if (typeof r.tag === "function")
        if (z._isErrorBoundary(r.tag))
          return this.classTagHandler({
            classComponent: r.tag,
            props: r.props
          }, g, r);
        else
          return this.functionTagHandler({
            funcComponent: r.tag,
            props: r.props
          }, g, r);
    }
    return N;
  }
  createHandler(r) {
    return (...g) => {
      try {
        const y = r.apply(null, g);
        if (K(y))
          return y.catch((P) => {
            return this.handleError(P, g[2], g[1]);
          });
        return y;
      } catch (y) {
        return this.handleError(y, g[2], g[1]);
      }
    };
  }
  functionTag(r) {
    return this.functionTagHandler = this.createHandler(r), this;
  }
  classTag(r) {
    return this.classTagHandler = this.createHandler(r), this;
  }
  stringTag(r) {
    return this.stringTagHandler = this.createHandler(r), this;
  }
  fragment(r) {
    return this.fragmentHandler = this.createHandler(r), this;
  }
  text(r) {
    return this.textHandler = this.createHandler(r), this;
  }
  primitive(r) {
    return this.primitiveHandler = this.createHandler(r), this;
  }
  onError(r) {
    return this.handleError = r, this;
  }
  match(r, g) {
    if (K(r)) {
      if (this.options.allowAsync === !1)
        O();
      return r.then((y) => {
        return this.matchSyncElem(y, {
          componentApi: f.clone(g.componentApi)
        });
      });
    }
    return this.matchSyncElem(r, {
      componentApi: f.clone(g.componentApi)
    });
  }
  matchMap(r, g) {
    const y = [], P = [];
    for (let J = 0;J < r.length; J++) {
      const b = r[J], S = g(b, (H, T) => this.match(H, T));
      if (K(S)) {
        if (this.options.allowAsync === !1)
          O();
        P.push(S.then((H) => {
          if (H !== N)
            y[J] = H;
        }));
      } else if (S !== N)
        y[J] = S;
    }
    if (P.length === 0)
      return y;
    return Promise.all(P).then(() => {
      return y;
    });
  }
}

class E {
  r;
  g;
  y;
  matcher;
  constructor(r, g = { allowAsync: !1 }, y = f.create(g)) {
    this.generator = r;
    this.options = g;
    this.rootComponentApi = y;
    this.matcher = new j(g);
    const P = this;
    this.matcher.functionTag((J, b) => {
      const S = J.funcComponent(J.props, b.componentApi);
      return P.renderChild(S, b);
    }).classTag((J, b) => {
      const H = new J.classComponent(J.props).render(J.props, b.componentApi);
      return P.renderChild(H, b);
    }).stringTag((J, b) => {
      const { attributes: S, children: H } = this.resolveProps(J.props), T = this.matcher.matchMap(H, (X, s) => s(X, {
        componentApi: f.clone(b.componentApi)
      }));
      return this.generator.createElement(J.tag, S, T);
    }).fragment((J, b) => {
      const S = Array.isArray(J) ? J.flat(1) : [J], H = this.matcher.matchMap(S, (T, X) => X(T, {
        componentApi: f.clone(b.componentApi)
      }));
      return this.generator.createFragment(H);
    }).text((J) => {
      return this.generator.createTextNode(J.text);
    }).primitive((J) => {
      return this.generator.createTextNode(J);
    }).onError((J, b, S) => {
      if (!i(b))
        throw J;
      if (d(b))
        return this.renderChild({
          type: "tag",
          tag: function H() {
            return new b.tag(b.props).onError(J, b.props, S.componentApi);
          },
          props: {}
        }, S);
      if (!$.is(J))
        throw new $("Rendering has failed due to an error: " + C(J), W(b));
      throw J.pushParent(W(b)), J;
    });
  }
  mapAttributeName(r) {
    if (this.options.attributeMap && r in this.options.attributeMap)
      return this.options.attributeMap[r];
    return r;
  }
  resolveProps({
    children: r,
    ...g
  }) {
    const y = {
      attributes: [],
      children: []
    };
    if (r)
      if (Array.isArray(r))
        y.children = r.flat(1);
      else
        y.children = [r];
    const P = Object.entries(g);
    for (let J = 0;J < P.length; J++) {
      const [b, S] = P[J];
      y.attributes.push([this.mapAttributeName(b), S]);
    }
    return y;
  }
  renderChild(r, g) {
    if (r === null)
      return N;
    return this.matcher.match(r, g);
  }
  render(r) {
    const g = this.renderChild(r, {
      componentApi: this.rootComponentApi
    });
    if (g === N)
      return this.generator.createTextNode("");
    if (K(g))
      return g.then((y) => {
        if (y === N)
          return this.generator.createTextNode("");
        return y;
      });
    return g;
  }
}

// ../html-renderer/jsx-elem-to-html-async.ts
class I extends V {
  createElement(r, g, y) {
    return Promise.resolve(y).then((P) => Promise.all(P)).then((P) => {
      const J = F(g), b = this.flattenChildrenCompact(P);
      return this.generateTagCompact(r, J, b);
    });
  }
  createTextNode(r) {
    return String(r);
  }
  createFragment(r) {
    return Promise.resolve(r).then((g) => Promise.all(g)).then((g) => {
      return this.flattenChildrenCompact(g);
    });
  }
}

class A extends V {
  createElement(r, g, y) {
    return Promise.resolve(y).then((P) => Promise.all(P)).then((P) => {
      const J = F(g), b = this.flattenChildren(P);
      return this.generateTag(r, J, b);
    });
  }
  createTextNode(r) {
    return [{ type: "text", content: String(r) }];
  }
  createFragment(r) {
    return Promise.resolve(r).then((g) => Promise.all(g)).then((g) => {
      return this.flattenChildren(g);
    });
  }
}
var k = (r, g, y = {}) => {
  const { pretty: P = !1 } = y;
  if (P) {
    const b = new E(new A(y), { ...y, allowAsync: !0 }, g).render(r);
    return Promise.resolve(b).then((S) => A.concatHtmlLines(S, y));
  } else {
    const J = new E(new I(y), { ...y, allowAsync: !0 }, g);
    return Promise.resolve(J.render(r));
  }
};

// ../html-renderer/render-to-html.ts
var c = (r, g) => {
  try {
    return _(r, void 0, g);
  } catch (y) {
    if ($.is(y))
      y.regenerateMessage();
    throw y;
  }
}, o = async (r, g) => {
  try {
    return await k(await r, void 0, g);
  } catch (y) {
    if ($.is(y))
      y.regenerateMessage();
    throw y;
  }
};

// jsx-dev-runtime.ts
var jr = (r, g) => {
  const { children: y, ...P } = g ?? {};
  if (Array.isArray(y))
    return R(r, P, ...y);
  return R(r, P, y);
};
export {
  o as renderToHtmlAsync,
  c as renderToHtml,
  u as jsxs,
  jr as jsxDEV,
  R as jsx,
  x as Fragment
};
