import { 
  initializeStorageWithDefaults, 
  getStorageItem,
  setStorageItem,
  storageInsertActions, 
  STORAGE_KEYS 
} from './lib/storage';
import { applyDefaultStyles, applyTagStyles } from './lib/utilities';
import { LOADED_CONTENT_SCRIPT } from './lib/constants';

chrome.runtime.onInstalled.addListener(async () => {
  await initializeStorageWithDefaults();
  // https://stackoverflow.com/questions/10994324/chrome-extension-content-script-re-injection-after-upgrade-or-install
  for (const cs of chrome.runtime.getManifest().content_scripts) {
    for (const tab of await chrome.tabs.query({url: cs.matches})) {
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: cs.js,
      });
    }
  }
});

chrome.runtime.onMessage.addListener(async (request, sender) => {
  if (sender.tab?.url?.startsWith("chrome://")) return;
  if (!sender.tab?.url?.includes("ottoneu.fangraphs.com")) return;
  if (sender.tab && request.message === LOADED_CONTENT_SCRIPT) {
    // Capture the sender.tab as a fallback to reference "last active" tab ID in other code. 
    await setStorageItem(STORAGE_KEYS.tabId, sender.tab.id);
    // Retrieve stored Default Styling Flag
    const useDefaultStyles = await getStorageItem(STORAGE_KEYS.defaultStylingFlag);
    // Immediately insert styles, if turned on
    if (useDefaultStyles) {
      applyDefaultStyles(sender.tab, storageInsertActions.SET);
    }
    // Insert player Tag CSS rules for use after the tab finishes loading
    applyTagStyles(sender.tab);
  }
});
