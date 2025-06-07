# Batcast

Batcast is a Chrome extension for enhancing a fantasy baseball interface with player- and matchup-based visual cues.

Currently supported is [Ottoneu](https://ottoneu.fangraphs.com/).

## Getting started

Default data comes from internal JSON files, converted from CSV exports from Google Sheets.

### Installing and running

1. Clone the repository
2. Run `npm install`
3. Run `npm start` for development mode, `npm run build` for production build
4. Add the extension to Chrome:
    1. Go to `chrome://extensions/`
    2. Enable the `Developer mode`
    3. Click on `Load unpacked`
    4. Choose the `dist` directory
5. You are good to go! You can also pin the extension to the toolbar for easy access.

### Project structure

All TypeScript files are placed in `src` directory.

Style files are placed in `styles` directory. There you can find per-page stylesheets and `batcast.sass` with default style overrides for the Ottoneu UI.

The `static` directory includes all the files to be copied over to the final build. It consists of `manifest.json` defining the extension, `.html` pages and icon set.
