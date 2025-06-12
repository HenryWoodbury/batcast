import { UPDATE_METRICS, UPDATE_STYLES } from '../lib/constants.ts';
import { getCurrentTab, applyDefaultStyles, applyDefaultMetrics } from '../lib/utilities.ts';
import { storageInsertActions, getStorageItem, STORAGE_KEYS } from '../lib/storage.ts';

const DEFAULT_STYLING_BUTTON = document.getElementById('toggleDefaultStyling');
const DEFAULT_METRICS_BUTTON = document.getElementById('toggleDefaultMetrics');
const CUSTOMIZE_STYLES_BUTTON = document.getElementById('customizeStyles');

(async () => {
  const useDefaultCss = await getStorageItem(STORAGE_KEYS.defaultStylingFlag);
  if (useDefaultCss) {
    DEFAULT_STYLING_BUTTON?.classList.add('on');
  } else {
    DEFAULT_STYLING_BUTTON?.classList.remove('on');
  }
  const useDefaultMetrics = await getStorageItem(STORAGE_KEYS.defaultMetricsFlag);
  if (useDefaultMetrics) {
    DEFAULT_METRICS_BUTTON?.classList.add('on');
  } else {
    DEFAULT_METRICS_BUTTON?.classList.remove('on');
  }
})();

CUSTOMIZE_STYLES_BUTTON?.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

DEFAULT_STYLING_BUTTON?.addEventListener('click', (event) => {
  event.preventDefault();
  getCurrentTab().then((tab: chrome.tabs.Tab) => {
    const isTurningOff = DEFAULT_STYLING_BUTTON.classList.contains('on');
    if (isTurningOff) {
      applyDefaultStyles(tab, storageInsertActions.UNSET);
      DEFAULT_STYLING_BUTTON.classList.remove('fixed');
      DEFAULT_STYLING_BUTTON.classList.remove('on');
    } else {
      applyDefaultStyles(tab, storageInsertActions.SET);
      DEFAULT_STYLING_BUTTON.classList.remove('fixed');
      DEFAULT_STYLING_BUTTON.classList.add('on');
    }
    (async () => {
      await chrome.runtime.sendMessage(
        { 
          message: UPDATE_STYLES,
          value: !isTurningOff
        }
      );
    })();
  });
});

DEFAULT_METRICS_BUTTON?.addEventListener('click', (event) => {
  event.preventDefault();
  getCurrentTab().then((tab: chrome.tabs.Tab) => {
    const isTurningOff = DEFAULT_METRICS_BUTTON.classList.contains('on');
    if (isTurningOff) {
      applyDefaultMetrics(tab, storageInsertActions.UNSET);
      DEFAULT_METRICS_BUTTON.classList.remove('fixed');
      DEFAULT_METRICS_BUTTON.classList.remove('on');
    } else {
      applyDefaultMetrics(tab, storageInsertActions.SET);
      DEFAULT_METRICS_BUTTON.classList.remove('fixed');
      DEFAULT_METRICS_BUTTON.classList.add('on');
    }  
    (async () => {
      await chrome.runtime.sendMessage(
        { 
          message: UPDATE_METRICS,
          value: !isTurningOff
        }
      );
    })();
  });
});

