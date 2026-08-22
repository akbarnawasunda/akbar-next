import { defineCliConfig } from "sanity/cli";
import { transformWithEsbuild, type Plugin } from "vite";

function sanitySdkJsxTransform(): Plugin {
  return {
    name: "sanity-sdk-jsx-transform",
    enforce: "pre",
    async transform(code, id) {
      if (!id.includes("@sanity/sdk-react") || !id.endsWith("/dist/index.js")) return null;
      const result = await transformWithEsbuild(code, id, { loader: "jsx", jsx: "automatic" });
      return { code: result.code, map: JSON.stringify(result.map) };
    },
  };
}

export default defineCliConfig({
  api: {
    projectId: "3t6l52on",
    dataset: "production",
  },
  vite: { plugins: [sanitySdkJsxTransform()] },
});
