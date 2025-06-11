# Batcast


TODO: Can I configure vite's `npm run dev` to be like webpack's 
`"start": "webpack --watch --config webpack.dev.js",`


npm run dev (or vite) starts a local web server with Hot Module Replacement for development, and will automatically change when code changes

npm run build (or vite build) builds the project, and outputs to the folder ./dist

npm run preview (or vite preview) start a local web server that serves the built solution from ./dist for previewing

## Sources

Extension development can be tricky as tutorials can be based on manifest 2 instead of manifest 3 and they are simply less written about.

Some sources I've found useful:

[02 | Building a Chrome Extension Template using Vite, React and TypeScript](https://medium.com/@jamesprivett29/02-building-a-chrome-extension-template-using-vite-react-and-typescript-d5d9912f1b40)

A very clean guide to using Vite as a bundler for an extension. Includes some very pertinent hints and gotchas.



