import { LOADED_CONTENT_SCRIPT } from '../lib/constants.ts';

(async () => {
  await chrome.runtime.sendMessage({ message: LOADED_CONTENT_SCRIPT });
})();
