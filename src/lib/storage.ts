import batters from '../data/batters.json' with { type: "json" };
import pitchers from '../data/pitchers.json' with { type: "json" };
import limits from '../data/limits.json' with { type: "json" };
import pfL from '../data/pfL.json' with { type: "json" };
import pfR from '../data/pfR.json' with { type: "json" };
import {
  type StorageObject,
  type StorageData,
  type ParkFactors,
  type ParkFactorsObject
} from './types.ts';

export const STORAGE_KEYS = {
  defaultStylingFlag: 'defaultStylingFlag',
  defaultMetricsFlag: 'defaultMetricsFlag',
  defaultBatterData: 'defaultBatterData',
  defaultPitcherData: 'defaultPitcherData',
  defaultLimitData: 'defaultLimitData',
  defaultPFLData: 'defaultPFL',
  defaultPFRData: 'defaultPFR',
  customSheetId: 'customSheetId',
  customBatterRange: 'customBatterRange',
  customBatterData: 'customBatterData',
  customPitcherRange: 'customPitcherRange',
  customPitcherData: 'customPitcherData',
  customLimitRange: 'customLimitRange',
  customLimitData: 'customLimitData',
  tabId: 'tabId',
}

export interface Storage {
  [STORAGE_KEYS.defaultStylingFlag]: boolean;
  [STORAGE_KEYS.defaultMetricsFlag]: boolean;
  [STORAGE_KEYS.defaultBatterData]: StorageObject;
  [STORAGE_KEYS.defaultPitcherData]: StorageObject;
  [STORAGE_KEYS.defaultLimitData]: StorageObject;
  [STORAGE_KEYS.defaultPFLData]: ParkFactorsObject;
  [STORAGE_KEYS.defaultPFRData]: ParkFactorsObject;
  [STORAGE_KEYS.customSheetId]: string;
  [STORAGE_KEYS.customBatterRange]: string;
  [STORAGE_KEYS.customPitcherRange]: string;
  [STORAGE_KEYS.customLimitRange]: string;
  [STORAGE_KEYS.customBatterData]: StorageObject;
  [STORAGE_KEYS.customPitcherData]: StorageObject;
  [STORAGE_KEYS.customLimitData]: StorageObject;
  [STORAGE_KEYS.tabId]: number | null;
}

export const STORAGE_DEFAULTS: Storage = {
  [STORAGE_KEYS.defaultStylingFlag]: false,
  [STORAGE_KEYS.defaultMetricsFlag]: false,
  [STORAGE_KEYS.defaultBatterData]: {},
  [STORAGE_KEYS.defaultPitcherData]: {},
  [STORAGE_KEYS.defaultLimitData]: {},
  [STORAGE_KEYS.defaultPFLData]: {},
  [STORAGE_KEYS.defaultPFRData]: {},
  [STORAGE_KEYS.customSheetId]: '',
  [STORAGE_KEYS.customBatterRange]: '',
  [STORAGE_KEYS.customBatterData]: {},
  [STORAGE_KEYS.customPitcherRange]: '',
  [STORAGE_KEYS.customPitcherData]: {},
  [STORAGE_KEYS.customLimitRange]: '',
  [STORAGE_KEYS.customLimitData]: {},
  [STORAGE_KEYS.tabId]: null,
};

export const storageInsertActions = {
  SET: 'set',
  UNSET: 'unset',
};

// Using chrome.storage.local to handle the large size of the saved data
// A switch to chrome.storage.sync would require retrieving data each session
export function getStorageData(): Promise<Storage> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      return resolve(result as Storage);
    });
  });
}

export function setStorageData(data: Storage): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      return resolve();
    });
  });
}

export function getStorageItem<Key extends keyof Storage>(
  key: Key,
): Promise<Storage[Key]> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      return resolve((result as Storage)[key]);
    });
  });
}

export function setStorageItem<Key extends keyof Storage>(
  key: Key,
  value: Storage[Key],
): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      return resolve();
    });
  });
}

export async function initializeStorageWithDefaults() {
  const currentStorageData = await getStorageData();
  const batterObj = {} as StorageObject;
  batters.forEach((entry: StorageData) => {
    batterObj[entry.OttoneuID] = {...entry};
  });
  const pitcherObj = {} as StorageObject;
  pitchers.forEach((entry: StorageData) => {
    pitcherObj[entry.OttoneuID] = {...entry};
  });
  const limitObj = {} as StorageObject;
  limits.forEach((entry: StorageData) => {
    limitObj[entry.LimitID] = {...entry};
  });
  const pfLObj = {} as ParkFactorsObject;
  const pfRObj = {} as ParkFactorsObject;
  pfL.forEach((entry: ParkFactors) => {
    if (entry.Abbr)
      pfLObj[entry.Abbr] = {...entry};
  });
  pfR.forEach((entry: ParkFactors) => {
    if (entry.Abbr)
      pfRObj[entry.Abbr] = {...entry};
  });
  const defaultObj = {
    [STORAGE_KEYS.defaultBatterData]: batterObj,
    [STORAGE_KEYS.defaultPitcherData]: pitcherObj,
    [STORAGE_KEYS.defaultLimitData]: limitObj,
    [STORAGE_KEYS.defaultPFLData]: pfLObj,
    [STORAGE_KEYS.defaultPFRData]: pfRObj,    
  }
  const defaultStorage = { ...currentStorageData, ...defaultObj };
  const newStorageData = { ...STORAGE_DEFAULTS, ...defaultStorage};
  await setStorageData(newStorageData);
}

export async function resetStorageItem(storageKey: string) {
  await setStorageItem(storageKey, STORAGE_DEFAULTS[storageKey]);
}
