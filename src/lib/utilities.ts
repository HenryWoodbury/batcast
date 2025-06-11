import { customAlphabet } from 'nanoid';
import {
  STORAGE_KEYS, 
  setStorageItem, 
  getStorageItem, 
  storageInsertActions 
} from './storage.ts';
import { 
  type Batter,
  type Pitcher,
  type SheetRange,
  type ColorRange,
  type GameInfo,
  type Limit,
  type LimitObject,
  type ParkFactorsObject,
  type StorageObject,
  type KeyString,
  type ValidationObject,
  type ValidationData,
  type CustomTableRecord,
  type StorageData
 } from './types.ts';
import {
  UNKNOWN_PITCHER_SPLIT,
  DEFAULT_PITCHER,
  LEAGUE_LHBvLHP,
  LEAGUE_RHBvLHP,
  LEAGUE_LHBvRHP,
  LEAGUE_RHBvRHP,
  VALIDATIONS,
  DEFAULT_CSS, 
  PLAYERS_CSS, 
  UPDATE_METRICS
} from './constants.ts';
import { translation } from '../locales/translation.ts';
import { validateDataObject } from './validations.ts';

// Note: If Dev Tools is open for the popup, this function returns undefined
// as the popup assumes lastFocusedWindow status
export const getCurrentTab = async () => {
  const queryOptions = { 
    active: true, 
    lastFocusedWindow: true,
    url: 'https://ottoneu.fangraphs.com/*'
  };
  const [tab] = await chrome.tabs.query(queryOptions);
  if (!tab) return getStoredTab();
  return tab;
}

export const getStoredTab = async () => {
  const tabId = await getStorageItem(STORAGE_KEYS.tabId) as number;
  return await chrome.tabs.get(tabId);
}

export const debounce = (timeout: number, callback: (event: Event) => void) => {
  let timeoutID = 0;
  return (event: Event) => {
    clearTimeout(timeoutID);
    timeoutID = window.setTimeout(() => callback(event), timeout);
  };
}

// Credit: https://medium.com/swlh/set-a-time-limit-on-async-actions-in-javascript-567d7ca018c2
export const dewait = async (timeLimit: number, task: Promise<void>, failureValue: string) => {
  let timeout;
  const timeoutPromise = new Promise((resolve, reject) => {
    timeout = setTimeout(() => {
      resolve(failureValue);
    }, timeLimit);
  });
  const response = await Promise.race([task, timeoutPromise]);
  if (timeout) clearTimeout(timeout);
  return response;
}

export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export const stringClamp = (num: number | string, min: string, max: string, digs = 0) =>
  Math.min(Math.max(Number(num), Number(min)), Number(max)).toFixed(digs);

export const messageCurrentTab = async (msg: string) => {
  await getCurrentTab().then(tab => {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { message: msg });
    }
  });
}

export const applyDefaultStyles = async (tab: chrome.tabs.Tab, action: string) => {
  if (!tab.id) return;
  if (action === storageInsertActions.SET) {
    // TODO: Test for DOM badge to prevent inserting the CSS more than once?
    await chrome.scripting.insertCSS({
      files: [ DEFAULT_CSS ],
      target: { tabId: tab.id }
    });
    await setStorageItem(STORAGE_KEYS.defaultStylingFlag, true);
  } else if (action === storageInsertActions.UNSET) {
    await chrome.scripting.removeCSS({
      files: [ DEFAULT_CSS ],
      target: { tabId: tab.id }
    });
    await setStorageItem(STORAGE_KEYS.defaultStylingFlag, false);
  }
}

export const applyDefaultMetrics = async (tab: chrome.tabs.Tab, action: string) => {
  if (action === storageInsertActions.SET) {
    await setStorageItem(STORAGE_KEYS.defaultMetricsFlag, true);
  } else if (action === storageInsertActions.UNSET) {
    await setStorageItem(STORAGE_KEYS.defaultMetricsFlag, false);
  }
  return await dewait(30000, messageCurrentTab(UPDATE_METRICS), UPDATE_METRICS);
}

export const applyCustomMetrics = async () => {
  return await dewait(30000, messageCurrentTab(UPDATE_METRICS), UPDATE_METRICS);
}

export const applyTagStyles = async(tab: chrome.tabs.Tab) => {
  if (!tab.id) return;
  await chrome.scripting.insertCSS({
    files: [ PLAYERS_CSS ],
    target: { tabId: tab.id }
  });
}

export const hide = (el: HTMLElement) => {
  el.classList.add('hide');
}

export const show = (el: HTMLElement) => {
  el.classList.remove('hide');
}

export const disable = (el: HTMLElement) => {
  el.setAttribute('disabled', 'disabled');
}

export const undisable = (el: HTMLElement) => {
  el.removeAttribute('disabled');
}

export const spin = (el: HTMLElement) => {
  el.classList.add('spinner');
  el.setAttribute('disabled', 'disabled');
}

export const unspin = (el: HTMLElement) => {
  el.classList.remove('spinner');
}

export const unspinreset =  (el: HTMLElement) => {
  el.classList.remove('spinner');
  el.removeAttribute('disabled');
}

export const createDataObject = (
  dataArray: SheetRange, 
  dataKeys: string[],
  dataType: string,
) => {
  const dataObject = {} as ValidationObject;
  const dataName = (translation.customDataTypes as KeyString)[dataType];
  if (dataArray.length < 2) {
    const fatalError = `${dataName} source has no data.`;
    return { dataObject, fatalError };
  }
  const arrayKeys = dataArray.shift();
  const hasOnlyValidKeys = arrayKeys && arrayKeys.every(val => dataKeys.includes(val.replace(/\s+/g, '')));
  if (!hasOnlyValidKeys) {
    const fatalError = `${dataName} sheet has invalid columns.`;
    return { dataObject, fatalError };
  }
  dataArray.forEach((entry, i) => {
    const customData = {} as ValidationData;
    // Validation done outside of loop since it requires comparisons between fields
    const validations = validateDataObject(dataType, entry);
    dataKeys.forEach((key, i) => {
      customData[key] = { value: entry[i], error: validations[key] };
    });
    const id = customData[dataKeys[0]].value;
    if (!id) return;
    // Chance of collision is very very very small with 16 characters.
    // https://zelark.github.io/nano-id-cc/
    const nanoCustomId = customAlphabet('1234567890abcdef', 16);
    const nanoId = nanoCustomId();
    if (dataObject[id]) {
      dataObject[id][dataKeys[0]].error = VALIDATIONS.DUPLICATE_ID;
      customData[dataKeys[0]].error = VALIDATIONS.DUPLICATE_ID;
      dataObject[`${id}.${nanoId}`] =  {...customData};
    } else if (customData[dataKeys[0]].error === VALIDATIONS.MISSING_ID) {
      dataObject[nanoId] = {...customData};
    } else {    
      dataObject[id] = {...customData};
    }
  });
  return { dataObject };
}

export const getValidData = (
  dataObject: ValidationObject, 
  customDataObject: CustomTableRecord,
  retainFirstDuplicate = false,
) => {
  const validData = {} as StorageObject;
  const filteredData = {} as ValidationObject;
  const duplicateIds = [] as string[];
  for (const key in dataObject) {
    if (!key) continue;
    const dataRow = dataObject[key];
    const id = dataRow[customDataObject.columns[0]].value;
    if (!id) continue;
    if (duplicateIds.indexOf(id) > -1) continue;
    const validationError = dataRow[customDataObject.columns[0]].error;
    if (validationError && validationError === VALIDATIONS.DUPLICATE_ID) {
      duplicateIds.push(id);
      if (!retainFirstDuplicate) continue;
      delete dataRow[customDataObject.columns[0]].error;
    }
    const validRow = {} as StorageData;
    const filteredRow = {} as ValidationData;
    customDataObject.columns.forEach((column) => {
      filteredRow[column] = { ...dataRow[column] };
      validRow[column] = dataRow[column].value || '';
    });
    filteredData[key] = { ...filteredRow };
    if (!validationError || (validationError === VALIDATIONS.DUPLICATE_ID && retainFirstDuplicate)) {
      validData[key] = { ...validRow };
    }
  }
  return { validData, filteredData };
}

export const mergeCustomData = (
  customData: StorageObject,
  defaultData: StorageObject
) => {
  const customMerge = {} as StorageObject;
  const customDataKeys = Object.keys(customData);
  customDataKeys.forEach(key => {
    if (defaultData[key]) {
      customMerge[key] = {...defaultData[key], ...customData[key]}
    } else {
      customMerge[key] = {...customData[key]};      
    }
  });
  return {...defaultData, ...customMerge};
}

export const createColorRange = (limit: Limit) => {
  const { Min, Max, Avg, Increments, MinColor, AvgColor, MaxColor } = limit;
  const digs = Avg.includes('.') ? 3 : 0;
  const fillUnit = Avg.includes('.') ? .001 : 1;
  const nMin = Number(Min);
  const nAvg = Number(Avg);
  const nMax = Number(Max);
  const steps = Number(Increments);
  const stepValue = (nMax - nMin) / steps;
  const stepsToAvg = Math.trunc((nAvg - nMin) / stepValue);
  const stepsToMax = steps - stepsToAvg - 1;
  const minRGB = MinColor.split(' ');
  const avgRGB = AvgColor.split(' ');
  const maxRGB = MaxColor.split(' ');
  const avgString = createColorString([ Number(avgRGB[0]), Number(avgRGB[1]), Number(avgRGB[2]) ]);
  const minToAvg = [
    calcColor(minRGB[0], avgRGB[0], stepsToAvg),
    calcColor(minRGB[1], avgRGB[1], stepsToAvg),
    calcColor(minRGB[2], avgRGB[2], stepsToAvg),
  ];
  const avgToMax = [
    calcColor(avgRGB[0], maxRGB[0], stepsToMax),
    calcColor(avgRGB[1], maxRGB[1], stepsToMax),
    calcColor(avgRGB[2], maxRGB[2], stepsToMax),
  ];
  const ColorRange: ColorRange = {};
  let stepR = Number(minRGB[0]);
  let stepG = Number(minRGB[1]);
  let stepB = Number(minRGB[2]);
  let pivot = false;
  ColorRange[`${nMax.toFixed(digs)}`] = createColorString([ Number(maxRGB[0]), Number(maxRGB[1]), Number(maxRGB[2]) ]);
  for (let i = nMin; i < nMax; i += stepValue) {
    const colorString = createColorString([stepR, stepG, stepB]);
    for (let j = i; j < i + stepValue; j += fillUnit) {
      ColorRange[`${j.toFixed(digs)}`] = colorString;
    }
    if (avgString === colorString) pivot = true;
    if (pivot) {
      stepR += avgToMax[0];
      stepG += avgToMax[1];
      stepB += avgToMax[2];
    } else {
      stepR += minToAvg[0];
      stepG += minToAvg[1];
      stepB += minToAvg[2];
    }
  }
  return ColorRange;
}

const createColorString = (rgb: number[]) => {
  const r = Math.round(rgb[0]);
  const g = Math.round(rgb[1]);
  const b = Math.round(rgb[2]);
  return `rgb(${r},${g},${b})`;
}

const calcColor = (colorFloor: string, colorCeiling: string, steps: number) => 
  (Number(colorCeiling) - Number(colorFloor)) / steps;

// https://stackoverflow.com/a/71768530
export const getBrightness = (r: number, g: number, b: number) => {
  let v = 0;
  v += 0.212655 * ((r/255) <= 0.04045 ? (r/255)/12.92 : Math.pow(((r/255)+0.055)/1.055, 2.4));
  v += 0.715158 * ((g/255) <= 0.04045 ? (g/255)/12.92 : Math.pow(((g/255)+0.055)/1.055, 2.4));
  v += 0.072187 * ((b/255) <= 0.04045 ? (b/255)/12.92 : Math.pow(((b/255)+0.055)/1.055, 2.4));
  const iv = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v,1.0/2.4) - 0.055;
  return Math.round(iv * 100)/100;
}

export const getBrightnessFromColorString = (rgb: string) => {
  // TODO: Confirm rgb is a valid string;
  const m = /(\d+)/g;
  const [ r, g, b ] = [...rgb.match(m)!];
  return getBrightness(Number(r), Number(g), Number(b));
};

export const getParkSplit = (gameInfo: GameInfo): string => {
  if (!gameInfo?.gameParkRank?.parkFactor) return `100`;
  return gameInfo.gameParkRank.parkFactor;
}

export const getBatterSplit = (batter: Batter, gameInfo: GameInfo) => {
  const vsRHP = Number(batter['vsRHP']) || Number(batter['vsRHPc']);
  const vsLHP = Number(batter['vsLHP']) || Number(batter['vsLHPc']);
// support calculated splits from `wOBA`
  return gameInfo.pitcherArm === 'R' ? vsRHP : vsLHP;
}

export const getAdjustedBatterSplit = (
  batterVsRHP: string, 
  batterVsLHP: string, 
  pitcherArm: string
) => {
  const vsRHP = Number(batterVsRHP);
  const vsLHP = Number(batterVsLHP);
  const vsAny = Math.min(vsLHP, vsRHP) / 4;
  // Assume 3 at bats come against starter, then worst platoon case for 1 at bat vs a reliever. 
  // This reflects the general effectiveness of RP matchups and modulates the value of players
  // with extreme platoon differences.
  return pitcherArm === 'R' ? vsRHP * 3 / 4 + vsAny : vsLHP * 3 / 4 + vsAny;
}

export const getPitcherSplit = (gameInfo: GameInfo) => {
  if (gameInfo.batterSide === 'L' || (gameInfo.batterSide === 'S' && gameInfo.pitcherArm === 'R')) {
    return gameInfo.pitcherVsLHB || UNKNOWN_PITCHER_SPLIT;
  } else {
    return gameInfo.pitcherVsRHB || UNKNOWN_PITCHER_SPLIT;
  }
}

// pitcher split can be declared as wOBA via the .vsRHB / .vsLHB columns in custom data sheets.
// Or it can be extrapolated from xFIP, which has a linear relationship to wOBA and is easier
// to obtain from projections and other data sources.
export const getPitcherImpact = (
  limitData: LimitObject,
  pitcherData: Pitcher,
) => {
  const pitcher = { ...DEFAULT_PITCHER, ...pitcherData };
  const xFIPtoWOBA = Number(limitData.BOBA.LeagueAvg) / Number(limitData.XFIP.LeagueAvg);
  const cWOBA = pitcher.FIP ? Number(pitcher.FIP) * xFIPtoWOBA : Number(limitData.XFIP.LeagueAvg) * xFIPtoWOBA;
  const vsRHBc = pitcher.Throws === 'R' ? cWOBA * LEAGUE_RHBvRHP : cWOBA * LEAGUE_RHBvLHP;
  const vsLHBc = pitcher.Throws === 'L' ? cWOBA * LEAGUE_LHBvLHP : cWOBA * LEAGUE_LHBvRHP;
  return {
    pitcherVsRHB: pitcher.vsRHB || vsRHBc.toFixed(3),
    pitcherVsLHB: pitcher.vsLHB || vsLHBc.toFixed(3),
    pitcherType: pitcher.Type,
  }
}

export const getParkFactor = (
  gameInfo: GameInfo, 
  limitData: LimitObject,
  pFL: ParkFactorsObject, 
  pFR: ParkFactorsObject,
) => {
  let pf = '100';
  if (gameInfo.gamePark) {
    const park = gameInfo.gamePark;
    const pfr = pFR[park]?.ParkFactor || '100';
    const pfl = pFL[park]?.ParkFactor || '100';
    const min = limitData.PF.Min;
    const max = limitData.PF.Max;
    if (gameInfo.batterSide === 'L' || (gameInfo.batterSide === 'S' && gameInfo.pitcherArm === 'R')) {
      pf = stringClamp(pfl, min, max);
    } else {
      pf = stringClamp(pfr, min, max);
    }
  }
  return pf;
}

export const getAggregate = (batter: Batter, gameInfo: GameInfo, limitData: LimitObject) => {
  const vsLHP = batter.vsLHP ? batter.vsLHP : batter.vsLHPc;
  const vsRHP = batter.vsRHP ? batter.vsRHP : batter.vsRHPc;
  if (!vsLHP || !vsRHP || !gameInfo.pitcherArm) return;
  const batterSplit = getAdjustedBatterSplit(vsRHP, vsLHP, gameInfo.pitcherArm);
  const nPark = Number(getParkSplit(gameInfo));
  const pitcherSplit = getPitcherSplit(gameInfo);
  // SP will rarely pitch more than 3 times through the order, limiting impact.
  // Most fantasy players hit near the top of the order and might get 3 PA against
  // good pitchers. And bad pitchers will no longer impact the game.
  const nP = pitcherSplit === UNKNOWN_PITCHER_SPLIT ? 0 : (Number(pitcherSplit) - Number(limitData.BOBA.LeagueAvg)) * 3 / 4;
  return ((batterSplit + nP) * nPark / 100).toFixed(3);  
}

/*

(wOBA - lwOBA) / wOBAScale

(.320 - .310 ) / .

You can turn wOBA into runs above average by subtracting out the league average wOBA 
and dividing by the wOBA scale and then multiplying by plate appearances.
wOBA scale: https://www.fangraphs.com/guts.aspx?type=cn

So if a 110 park means a park that produces run scoring 20% higher than norm, but halved
for 81 games out of 62, what does that mean for individual player wOBA?

– R/PA is runs per plate appearance
– R/W is the runs to wins conversion number

A R/PA of .115 produces Runs / G when multiplied by team PA

*/