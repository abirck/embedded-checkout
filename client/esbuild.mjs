import * as esbuild from "esbuild";
import postcss from "esbuild-postcss";

await esbuild.build({
  entryPoints: ["src/index.tsx"],
  bundle: true,
  minify: true,
  sourcemap: true,
  // target: "chrome58,firefox57,safari11,edge16", // TODO: evaluate if I should increase these
  outfile: "../public/main.js",
  plugins: [postcss()],
});
