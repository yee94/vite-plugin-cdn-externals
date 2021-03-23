// @ts-ignore
import * as path from "path";

const cdnExternals = externals => {
  const externalNpmNames = Object.keys(externals);

  const dependencies = externalNpmNames.reduce((prev, npmName) => {
    const exports = require(path.resolve(
      process.cwd(),
      "node_modules",
      npmName
    ));
    return Object.assign(prev, { [`${npmName}`]: Object.keys(exports) });
  }, {});

  return {
    name: "vite:cdn-externals",
    enforce: "pre",
    config() {
      return {
        optimizeDeps: {
          exclude: [...externalNpmNames,'@alife/next/*']
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
        
        ${dependencies[id]
          .filter(key => /^[\w|_]+$/.test(key))
          .map(key => `export const ${key} = modules["${key}"];`)
          .join("\n")}
          
        export default modules;
        `;
      }

      return null;
    }
  };
};
export default cdnExternals;
