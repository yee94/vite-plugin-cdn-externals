var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};
var __exportStar = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  return __exportStar(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
};
__markAsModule(exports);
__export(exports, {
  default: () => src_default
});
var path = __toModule(require("path"));
const alias = {
  js: "application/javascript",
  css: "text/css",
  html: "text/html",
  json: "application/json"
};
const cdnExternals = (externals) => {
  const externalNpmNames = Object.keys(externals);
  const dependencies = externalNpmNames.reduce((prev, npmName) => {
    const exports2 = require(path.resolve(process.cwd(), "node_modules", npmName));
    return Object.assign(prev, {[`${npmName}`]: Object.keys(exports2)});
  }, {});
  return {
    name: "vite:cdn-externals",
    enforce: "pre",
    config() {
      return {
        optimizeDeps: {
          exclude: [...externalNpmNames, "@alife/next/*"]
        }
      };
    },
    resolveId(id) {
      if (dependencies[id]) {
        return {
          id
        };
      }
      return null;
    },
    load(id) {
      if (dependencies[id]) {
        return `
        var modules = window["${externals[id]}"];
        
        ${dependencies[id].filter((key) => /^[\w|_]+$/.test(key)).map((key) => `export const ${key} = modules["${key}"];`).join("\n")}
          
        export default modules;
        `;
      }
      return null;
    }
  };
};
var src_default = cdnExternals;
