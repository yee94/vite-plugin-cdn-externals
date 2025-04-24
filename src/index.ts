import * as path from "path";
import mkdirp from "mkdirp-sync";
import { getExportsRuntime } from "pkg-exports";
import * as fs from "fs";
import { createHash } from "crypto";
import type { Plugin } from "vite";

async function getExternalCode(npmName: string, windowName: string) {
	try {
		const exports = await getExportsRuntime(npmName);

		const eachExport = exports
			.filter((key) => {
				if (!/^[\w|_]+$/.test(key)) {
					return false;
				}
				if (["default", "__esModule"].includes(key)) {
					return false;
				}

				return true;
			})
			.map((key) => `export const ${key} = modules["${key}"];`);

		return `var modules = window["${windowName}"];
        
        ${eachExport.join("\n")}

        export default modules;`;
	} catch (e) {
		console.warn(`Could not load external code for ${npmName}`);
	}
}

export function getAssetHash(content: Buffer | string) {
	return createHash("sha256").update(content).digest("hex").slice(0, 8);
}

const optimizeCacheDir = path.join(
	process.cwd(),
	"node_modules/.vite-plugin-cdn-externals",
);

const cdnExternals = (
	externals: Record<
		string,
		string | { windowName: string; find: string | RegExp }
	>,
) => {
	mkdirp(optimizeCacheDir);

	return {
		name: "vite:cdn-externals",
		enforce: "pre",
		async config() {
			const alias = (
				await Promise.all(
					Object.entries(externals).map(async ([npmName, option]) => {
						let windowName = option;
						let find = npmName;
						if (typeof option === "object") {
							windowName = option.windowName;
							find = <string>option.find;
						}

						const code = await getExternalCode(npmName, <string>windowName);
						if (!code) {
							return null;
						}

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
					}),
				)
			).filter(Boolean);

			return {
				optimizeDeps: {
					exclude: Object.keys(externals),
				},
				resolve: {
					alias,
				},
			};
		},
	} as Plugin;
};
export default cdnExternals;
