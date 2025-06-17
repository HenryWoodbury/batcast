# Batcast

`npm run build` builds the project with Rollup, and outputs to the folder `./dist`

## Sources

Extension development can be tricky as many tutorials are based on manifest 2 instead of manifest 3 and extension developers are not a huge community.

Some sources I've found useful:

[02 | Building a Chrome Extension Template using Vite, React and TypeScript](https://medium.com/@jamesprivett29/02-building-a-chrome-extension-template-using-vite-react-and-typescript-d5d9912f1b40)

A very clean guide to using Vite as a bundler for an extension. While I elected not to use Vite (see below), this tutorial also covers a number of features of an extension in a very clear way. Includes some very pertinent hints and gotchas.

[OAuth 2.0: authenticate users with Google](https://developer.chrome.com/docs/extensions/how-to/integrate/oauth)

Google's guide to using OAuth 2.0 to enable an extension to authenticate users with Google.

## Development Notes

For notes on bundling, unit testing, and other development topics, see the [Wiki](https://github.com/HenryWoodbury/batcast/wiki).