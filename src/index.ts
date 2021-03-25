import * as path from "path";
import mkdirp from "mkdirp-sync";
import * as fs from "fs";
import { createHash } from "crypto";

function getExternalCode(npmName: string, windowName: string) {
  const exports = require(path.resolve(process.cwd(), "node_modules", npmName));
  const eachExport = Object.keys(exports)
    .filter((key) => /^[\w|_]+$/.test(key))
    .map((key) => `export const ${key} = modules["${key}"];`);

  return `var modules = window["${windowName}"];
        
        ${eachExport.join("\n")}
          
        export default modules;
        `;
}

export function getAssetHash(content: Buffer | string) {
  return createHash("sha256").update(content).digest("hex").slice(0, 8);
}

const optimizeCacheDir = path.join(
  process.cwd(),
  `node_modules/.vite-plugin-externals`
);

const cdnExternals = (
  externals: Record<
    string,
    string | { windowName: string; find: string | RegExp }
  >
) => {
  mkdirp(optimizeCacheDir);

  const alias = Object.entries(externals).map(([npmName, option]) => {
    let windowName = option;
    let find = npmName;
    if (typeof option === "object") {
      windowName = option.windowName;
      find = <string>option.find;
    }

    const code = getExternalCode(npmName, <string>windowName);

    const hash = getAssetHash(code);
    const fileName = `${npmName.replace("/", "_")}.${hash}.js`;
    const dependencyFile = path.resolve(optimizeCacheDir, fileName);
    if (!fs.existsSync(dependencyFile)) {
      fs.writeFileSync(dependencyFile, code);
    }

    return {
      find,
      replacement: dependencyFile,
    };
  });

  return {
    name: "vite:cdn-externals",
    enforce: "pre",
    config() {
      return {
        resolve: {
          alias,
        },
      };
    },
  };
};
export default cdnExternals;
