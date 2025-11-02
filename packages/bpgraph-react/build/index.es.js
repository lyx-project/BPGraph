import oe, { createContext as ee, useContext as re, useRef as ae, useMemo as ce, useEffect as se } from "react";
import { Graph as ne } from "@bpgraph/core";
import { Engine as le } from "@bpgraph/core/engine";
var $ = { exports: {} }, p = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Z;
function ie() {
  if (Z) return p;
  Z = 1;
  var i = Symbol.for("react.transitional.element"), m = Symbol.for("react.fragment");
  function n(u, c, o) {
    var f = null;
    if (o !== void 0 && (f = "" + o), c.key !== void 0 && (f = "" + c.key), "key" in c) {
      o = {};
      for (var k in c)
        k !== "key" && (o[k] = c[k]);
    } else o = c;
    return c = o.ref, {
      $$typeof: i,
      type: u,
      key: f,
      ref: c !== void 0 ? c : null,
      props: o
    };
  }
  return p.Fragment = m, p.jsx = n, p.jsxs = n, p;
}
var O = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Q;
function ue() {
  return Q || (Q = 1, process.env.NODE_ENV !== "production" && (function() {
    function i(e) {
      if (e == null) return null;
      if (typeof e == "function")
        return e.$$typeof === Y ? null : e.displayName || e.name || null;
      if (typeof e == "string") return e;
      switch (e) {
        case T:
          return "Fragment";
        case x:
          return "Profiler";
        case W:
          return "StrictMode";
        case g:
          return "Suspense";
        case y:
          return "SuspenseList";
        case D:
          return "Activity";
      }
      if (typeof e == "object")
        switch (typeof e.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), e.$$typeof) {
          case M:
            return "Portal";
          case C:
            return (e.displayName || "Context") + ".Provider";
          case j:
            return (e._context.displayName || "Context") + ".Consumer";
          case h:
            var r = e.render;
            return e = e.displayName, e || (e = r.displayName || r.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
          case N:
            return r = e.displayName || null, r !== null ? r : i(e.type) || "Memo";
          case w:
            r = e._payload, e = e._init;
            try {
              return i(e(r));
            } catch {
            }
        }
      return null;
    }
    function m(e) {
      return "" + e;
    }
    function n(e) {
      try {
        m(e);
        var r = !1;
      } catch {
        r = !0;
      }
      if (r) {
        r = console;
        var t = r.error, s = typeof Symbol == "function" && Symbol.toStringTag && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return t.call(
          r,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          s
        ), m(e);
      }
    }
    function u(e) {
      if (e === T) return "<>";
      if (typeof e == "object" && e !== null && e.$$typeof === w)
        return "<...>";
      try {
        var r = i(e);
        return r ? "<" + r + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function c() {
      var e = R.A;
      return e === null ? null : e.getOwner();
    }
    function o() {
      return Error("react-stack-top-frame");
    }
    function f(e) {
      if (I.call(e, "key")) {
        var r = Object.getOwnPropertyDescriptor(e, "key").get;
        if (r && r.isReactWarning) return !1;
      }
      return e.key !== void 0;
    }
    function k(e, r) {
      function t() {
        V || (V = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          r
        ));
      }
      t.isReactWarning = !0, Object.defineProperty(e, "key", {
        get: t,
        configurable: !0
      });
    }
    function G() {
      var e = i(this.type);
      return z[e] || (z[e] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), e = this.props.ref, e !== void 0 ? e : null;
    }
    function L(e, r, t, s, b, E, U, q) {
      return t = E.ref, e = {
        $$typeof: A,
        type: e,
        key: r,
        props: E,
        _owner: b
      }, (t !== void 0 ? t : null) !== null ? Object.defineProperty(e, "ref", {
        enumerable: !1,
        get: G
      }) : Object.defineProperty(e, "ref", { enumerable: !1, value: null }), e._store = {}, Object.defineProperty(e._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(e, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(e, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: U
      }), Object.defineProperty(e, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: q
      }), Object.freeze && (Object.freeze(e.props), Object.freeze(e)), e;
    }
    function P(e, r, t, s, b, E, U, q) {
      var l = r.children;
      if (l !== void 0)
        if (s)
          if (a(l)) {
            for (s = 0; s < l.length; s++)
              S(l[s]);
            Object.freeze && Object.freeze(l);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else S(l);
      if (I.call(r, "key")) {
        l = i(e);
        var _ = Object.keys(r).filter(function(te) {
          return te !== "key";
        });
        s = 0 < _.length ? "{key: someKey, " + _.join(": ..., ") + ": ...}" : "{key: someKey}", H[l + s] || (_ = 0 < _.length ? "{" + _.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          s,
          l,
          _,
          l
        ), H[l + s] = !0);
      }
      if (l = null, t !== void 0 && (n(t), l = "" + t), f(r) && (n(r.key), l = "" + r.key), "key" in r) {
        t = {};
        for (var J in r)
          J !== "key" && (t[J] = r[J]);
      } else t = r;
      return l && k(
        t,
        typeof e == "function" ? e.displayName || e.name || "Unknown" : e
      ), L(
        e,
        l,
        E,
        b,
        c(),
        t,
        U,
        q
      );
    }
    function S(e) {
      typeof e == "object" && e !== null && e.$$typeof === A && e._store && (e._store.validated = 1);
    }
    var v = oe, A = Symbol.for("react.transitional.element"), M = Symbol.for("react.portal"), T = Symbol.for("react.fragment"), W = Symbol.for("react.strict_mode"), x = Symbol.for("react.profiler"), j = Symbol.for("react.consumer"), C = Symbol.for("react.context"), h = Symbol.for("react.forward_ref"), g = Symbol.for("react.suspense"), y = Symbol.for("react.suspense_list"), N = Symbol.for("react.memo"), w = Symbol.for("react.lazy"), D = Symbol.for("react.activity"), Y = Symbol.for("react.client.reference"), R = v.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, I = Object.prototype.hasOwnProperty, a = Array.isArray, d = console.createTask ? console.createTask : function() {
      return null;
    };
    v = {
      react_stack_bottom_frame: function(e) {
        return e();
      }
    };
    var V, z = {}, X = v.react_stack_bottom_frame.bind(
      v,
      o
    )(), B = d(u(o)), H = {};
    O.Fragment = T, O.jsx = function(e, r, t, s, b) {
      var E = 1e4 > R.recentlyCreatedOwnerStacks++;
      return P(
        e,
        r,
        t,
        !1,
        s,
        b,
        E ? Error("react-stack-top-frame") : X,
        E ? d(u(e)) : B
      );
    }, O.jsxs = function(e, r, t, s, b) {
      var E = 1e4 > R.recentlyCreatedOwnerStacks++;
      return P(
        e,
        r,
        t,
        !0,
        s,
        b,
        E ? Error("react-stack-top-frame") : X,
        E ? d(u(e)) : B
      );
    };
  })()), O;
}
var K;
function fe() {
  return K || (K = 1, process.env.NODE_ENV === "production" ? $.exports = ie() : $.exports = ue()), $.exports;
}
var F = fe();
function be(i, m) {
  const n = ee(null);
  function u({ children: o }) {
    const f = new ne(i, m);
    return /* @__PURE__ */ F.jsx(n.Provider, { value: f, children: o });
  }
  function c() {
    const o = re(n);
    if (!o) throw new Error("GraphContext not found");
    return o;
  }
  return { GraphProvider: u, useGraph: c };
}
function ke(i, m) {
  const n = ee(null);
  function u({ children: o }) {
    const f = new le(i, m);
    return /* @__PURE__ */ F.jsx(n.Provider, { value: f, children: o });
  }
  function c() {
    const o = re(n);
    if (!o) throw new Error("EngineContext not found");
    return o;
  }
  return { EngineProvider: u, useEngine: c };
}
function ve({
  width: i = "100%",
  height: m = "100%",
  graph: n,
  className: u,
  children: c,
  options: o,
  onNodeClick: f,
  onNodeDoubleClick: k,
  onNodeSelection: G,
  onBlankClick: L,
  onBlankDoubleClick: P,
  onLinkClick: S,
  onDragStart: v,
  onDrag: A,
  onDragEnd: M,
  onStartConnecting: T,
  onKeyDown: W
}) {
  const x = ae(null), j = (a, d) => {
    f?.(a, d);
  }, C = (a, d) => {
    k?.(a, d);
  }, h = (a) => {
    G?.(a.filter((d) => d instanceof ne.NodeInstance));
  }, g = (a) => {
    L?.(a);
  }, y = (a) => {
    P?.(a);
  }, N = (a, d) => {
    S?.(a, d);
  }, w = (a) => {
    v?.(a);
  }, D = (a) => {
    A?.(a);
  }, Y = (a) => {
    M?.(a);
  }, R = () => {
    T?.();
  }, I = (a) => {
    W?.(a);
  };
  return ce(() => {
    n && n.setOptions(o);
  }, []), se(() => {
    if (!(!n || !x.current))
      return n.setContainer(x.current), n.on("node:click", j), n.on("node:dblclick", C), n.on("selection:changed", h), n.on("blank:click", g), n.on("blank:dblclick", y), n.on("link:click", N), n.on("node:dragstart", w), n.on("node:dragmove", D), n.on("node:dragend", Y), n.on("start:connecting", R), () => {
        n.off("node:click", j), n.off("node:dblclick", C), n.off("selection:changed", h), n.off("blank:click", g), n.off("blank:dblclick", y), n.off("link:click", N), n.off("node:dragstart", w), n.off("node:dragmove", D), n.off("node:dragend", Y), n.off("start:connecting", R);
      };
  }, []), /* @__PURE__ */ F.jsxs("div", { style: { position: "relative", width: i, height: m }, children: [
    /* @__PURE__ */ F.jsx(
      "div",
      {
        style: { width: "100%", height: "100%" },
        className: u,
        onKeyDown: I,
        ref: x
      }
    ),
    c
  ] });
}
export {
  ve as GraphView,
  ke as createEngineContext,
  be as createGraphContext
};
