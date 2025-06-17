# Batcast

`npm run build` builds the project with Rollup, and outputs to the folder `./dist`

## Sources

Extension development can be tricky as many tutorials are based on manifest 2 instead of manifest 3 and extension developers are not a huge community.

Some sources I've found useful:

[02 | Building a Chrome Extension Template using Vite, React and TypeScript](https://medium.com/@jamesprivett29/02-building-a-chrome-extension-template-using-vite-react-and-typescript-d5d9912f1b40)

A very clean guide to using Vite as a bundler for an extension. While I elected not to use Vite (see below), this tutorial also covers a number of features of an extension in a very clear way. Includes some very pertinent hints and gotchas.

[OAuth 2.0: authenticate users with Google](https://developer.chrome.com/docs/extensions/how-to/integrate/oauth)

Google's guide to using OAuth 2.0 to enable an extension to authenticate users with Google.

## Build Notes

### Using Vite as a Bundler

An enormous hurdle in using [Vite](https://www.npmjs.com/package/rollup) to bundle a Chrome extension is that extension entry points may **not** use dynamic imports. Unlike the underlying Rollup library, Vite does **not** support the use of an array of inputs and outputs.

Multiple input files mapped to an output with `inlineDynamicImports: true` will throw an error.

There is a very informative discussion of this issue here: [Support multiple inputs when "output.inlineDynamicImports" is true](https://github.com/rollup/rollup/issues/5601)

One alternative to the custom scripting described in that thread is to use rollup directly without recourse to Vite's dev server.

### Using Rollup as a Bundler

[Rollup](https://www.npmjs.com/package/rollup) utilizes standard ES module imports and exports to optimize library bundling. Ironically its value in the case of bundling an extension is that it supports using an array of individual input and output entry points, each set to `inlineDynamicImports: true`.

The actual implementation utilizes several plugins, including the [@rollup-extras/plugin-copy](https://www.npmjs.com/package/@rollup-extras/plugin-copy) for copying over html, css, and binary files.

The input files that directly import JSON require [@rollup/plugin-json](https://www.npmjs.com/package/@rollup/plugin-json) as a plugin.
