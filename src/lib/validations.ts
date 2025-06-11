import universe from '../data/universe.json' with { type: "json" };
import { 
  VALIDATIONS,
  LIMIT_IDS,
  CUSTOM_DATA_TYPES,
  BATS,
  THROWS,
} from './constants.ts';
import {
  LimitKeys,
  PlayerKeys,
  BatterKeys,
  PitcherKeys,
  type StorageData,
} from './types.ts';

export const validateDataObject = (
  dataType: string,
  entry: string[],
) => {
  const errorObject = {} as StorageData;
  const id = entry[0];
  if (dataType === CUSTOM_DATA_TYPES.LIMIT) {
    if (!id) { 
      errorObject[LimitKeys[0]] = VALIDATIONS.MISSING_ID;
    } else if (!(id in LIMIT_IDS)) {
      errorObject[LimitKeys[0]] = VALIDATIONS.INVALID_ID;
    }
    for (let i = 6; i < 9; i++) {
      if (!isColorCode(entry[i])) {
        errorObject[LimitKeys[0]] = VALIDATIONS.INVALID_ROW;
        errorObject[LimitKeys[i]] = VALIDATIONS.INVALID_COLOR;
      }
    }
    const rangeErrors = isValidRange(entry[2], entry[3], entry[4]);
    for (const key in rangeErrors) {
      errorObject[key] = rangeErrors[key];
    }
    if (entry[5]) {
      const vIncrements = Number(entry[5]);
      if (!Number.isInteger(vIncrements)) {
        errorObject[LimitKeys[0]] = VALIDATIONS.INVALID_ROW;
        errorObject[LimitKeys[5]] = VALIDATIONS.INVALID_ENTRY;
      } else if (vIncrements < 1) {
        errorObject[LimitKeys[0]] = VALIDATIONS.INVALID_ROW;
        errorObject[LimitKeys[5]] = VALIDATIONS.INVALID_RANGE;
      }
    }
    if (entry[9]) {
      const vLeagueAvg = Number(entry[9]);
      if (isNaN(vLeagueAvg)) {
        errorObject[LimitKeys[0]] = VALIDATIONS.INVALID_ROW;
        errorObject[LimitKeys[9]] = VALIDATIONS.INVALID_ENTRY;
      }
    }
  } else {
    if (!id) { 
      errorObject[PlayerKeys[0]] = VALIDATIONS.MISSING_ID;
    } else if (universe.id.indexOf(id) < 0) {
      errorObject[PlayerKeys[0]] = VALIDATIONS.INVALID_ID;
    }
    if (entry[7] && !(entry[7] in BATS)) {
      errorObject[PlayerKeys[0]] = VALIDATIONS.INVALID_ROW;
      errorObject[PlayerKeys[7]] = VALIDATIONS.INVALID_ENTRY; 
    }
    if (entry[8] && !(entry[8] in THROWS)) {
      errorObject[PlayerKeys[0]] = VALIDATIONS.INVALID_ROW;
      errorObject[PlayerKeys[8]] = VALIDATIONS.INVALID_ENTRY; 
    }
    for (let i = 11; i < 14; i++) {
      if (entry[i]) {
        const wOBAorFIP = Number(entry[i]);
        const key = dataType === CUSTOM_DATA_TYPES.BATTER ? BatterKeys[i] : PitcherKeys[i];
        if (isNaN(wOBAorFIP)) {
          errorObject[PlayerKeys[0]] = VALIDATIONS.INVALID_ROW;
          errorObject[key] = VALIDATIONS.INVALID_ENTRY;
        }
      }
    }
  }
  return errorObject;
}

const isValidRange = (min: string, max: string, avg: string) => {
  // If all range values are undefined, that's okay.
  if (!min && !max && !avg) return {};
  const errorObject = {} as StorageData;
  const vMin = Number(min);
  const vMax = Number(max);
  const vAvg = Number(avg);
  if (isNaN(vMin)) {
    errorObject[LimitKeys[0]] = VALIDATIONS.INVALID_ROW;
    errorObject[LimitKeys[2]] = VALIDATIONS.INVALID_ENTRY;
  }
  if (isNaN(vMax)) {
    errorObject[LimitKeys[0]] = VALIDATIONS.INVALID_ROW;
    errorObject[LimitKeys[3]] = VALIDATIONS.INVALID_ENTRY;
  }
  if (isNaN(vAvg)) {
    errorObject[LimitKeys[0]] = VALIDATIONS.INVALID_ROW;
    errorObject[LimitKeys[4]] = VALIDATIONS.INVALID_ENTRY;
  }
  if (!isNaN(vMin) && !isNaN(vAvg) && !isNaN(vMax)) {
    if (vMin > vAvg || vAvg > vMax) {
      errorObject[LimitKeys[0]] = VALIDATIONS.INVALID_ROW;
      errorObject[LimitKeys[2]] = VALIDATIONS.INVALID_RANGE;
      errorObject[LimitKeys[3]] = VALIDATIONS.INVALID_RANGE;
      errorObject[LimitKeys[4]] = VALIDATIONS.INVALID_RANGE;
    }
  }
  return errorObject;
}

const isColorCode = (code: string) => {
  // undefined is okay.
  if (!code) return true;
  const rgb = code.split(' ');
  if (rgb.length !== 3) return false;
  const vR = Number(rgb[0]);
  const vG = Number(rgb[1]);
  const vB = Number(rgb[2]);
  if (!Number.isInteger(vR) || vR < 0 || vR > 255) return false;
  if (!Number.isInteger(vG) || vG < 0 || vG > 255) return false;
  if (!Number.isInteger(vB) || vB < 0 || vB > 255) return false;
  return true;
}
