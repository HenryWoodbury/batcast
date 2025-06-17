// import '../../styles/options.sass';
import { getSheetData, disconnect } from '../services/oauth.ts';
import { renderElement, renderTree } from '../lib/renders.ts';
import { activateTooltips, renderPreviewTooltips, tooltip } from '../components/tooltip.ts';
import { 
  applyDefaultMetrics,
  applyDefaultStyles, 
  applyCustomMetrics, 
  createDataObject,
  getCurrentTab, 
  hide,
  show,
  spin,
  unspin,
  undisable,
  unspinreset,
  getValidData,
} from '../lib/utilities.ts';
import { 
  UPDATE_METRICS, 
  UPDATE_STYLES, 
  CUSTOM_DATA_TYPES,
  VALIDATIONS,
} from '../lib/constants.ts';
import { 
  storageInsertActions, 
  getStorageItem, 
  setStorageItem, 
  resetStorageItem, 
  STORAGE_KEYS, 
} from '../lib/storage.ts';
import { 
  type SheetRange,
  type EventMessage,
  BatterKeys,
  PitcherKeys,
  LimitKeys,
  type StorageObject,
  type KeyString,
  type ValidationObject,
  type ElementDefinition,
  type CustomTableRecord
} from '../lib/types.ts';
import { translation } from '../locales/translation.ts';

const CONNECT_BUTTON = document.getElementById('connectButton');
const DISCONNECT_BUTTON = document.getElementById('disconnectButton');
const CONNECT_FORM = document.getElementById('customMetrics');
const DEFAULT_METRICS_BUTTON = document.getElementById('defaultMetrics');
const DEFAULT_STYLING_BUTTON = document.getElementById('defaultStyling');
const CONNECT_SHEET_ID_INPUT = document.getElementById('connectSheetId');
const CONNECT_BATTER_RANGE_INPUT = document.getElementById('connectBatterRange');
const CONNECT_PITCHER_RANGE_INPUT = document.getElementById('connectPitcherRange');
const CONNECT_LIMIT_RANGE_INPUT = document.getElementById('connectLimitRange');
const FORM_FEEDBACK = document.getElementById('formFeedback');
const DATA_ERROR = document.getElementById('dataError');
const DATA_TO_SAVE = document.getElementById('dataToSave');
const OVERWRITE_WARNING = document.getElementById('overwriteWarning');
const UPDATE_WARNING = document.getElementById('updateWarning');
const SAVED_DATA = document.getElementById('dataSaved');
const TO_SAVE_ALL_NODE = document.getElementById('toSaveAll');
const TO_ABANDON_ALL_NODE = document.getElementById('toSaveAbandonAll');
const SAVED_ABANDON_ALL_NODE = document.getElementById('savedAbandonAll');

const CUSTOM_DATA_TO_SAVE = {
  [CUSTOM_DATA_TYPES.BATTER]: {},
  [CUSTOM_DATA_TYPES.PITCHER]: {},
  [CUSTOM_DATA_TYPES.LIMIT]: {},
}

const BATTER_NODES = {
  toSaveNode: document.getElementById('battersToSave'),
  toSaveFeedbackNode: document.getElementById('battersToSaveFeedback'),
  toSaveTableWrapperNode: document.getElementById('battersToSaveTableWrapper'),
  toSaveButtonNode: document.getElementById('battersToSaveSave'),
  toSaveAbandonButtonNode: document.getElementById('battersToSaveAbandon'),
  savedNode: document.getElementById('battersSaved'),
  savedTableWrapperNode: document.getElementById('battersSavedTableWrapper'),
  savedAbandonButtonNode: document.getElementById('battersSavedAbandon'),
  validationNode: document.getElementById('battersValidation'),
}

const PITCHER_NODES = {
  toSaveNode: document.getElementById('pitchersToSave'),
  toSaveFeedbackNode: document.getElementById('pitchersToSaveFeedback'),
  toSaveTableWrapperNode: document.getElementById('pitchersToSaveTableWrapper'),
  toSaveButtonNode: document.getElementById('pitchersToSaveSave'),
  toSaveAbandonButtonNode: document.getElementById('pitchersToSaveAbandon'),
  savedNode: document.getElementById('pitchersSaved'),
  savedTableWrapperNode: document.getElementById('pitchersSavedTableWrapper'),
  savedAbandonButtonNode: document.getElementById('pitchersSavedAbandon'),
  validationNode: document.getElementById('pitchersValidation'),
}

const LIMIT_NODES = {
  toSaveNode: document.getElementById('limitsToSave'),
  toSaveFeedbackNode: document.getElementById('limitsToSaveFeedback'),
  toSaveTableWrapperNode: document.getElementById('limitsToSaveTableWrapper'),
  toSaveButtonNode: document.getElementById('limitsToSaveSave'),
  toSaveAbandonButtonNode: document.getElementById('limitsToSaveAbandon'),
  savedNode: document.getElementById('limitsSaved'),
  savedTableWrapperNode: document.getElementById('limitsSavedTableWrapper'),
  savedAbandonButtonNode: document.getElementById('limitsSavedAbandon'),
  validationNode: document.getElementById('limitsValidation'),
}

const BATTERS_SAVED = {
  dataType: CUSTOM_DATA_TYPES.BATTER,
  columns: BatterKeys,
  storageKey: STORAGE_KEYS.customBatterData,
  feedbackNodeId: 'battersSavedFeedback',
  tableNodeId: 'battersTableSaved',
  previewNodeId: 'battersTablePreviewSaved',
  completeNodeId: 'battersTableCompleteSaved',
  footerNodeId: 'battersTableFooterSaved',
  toggleNodeId: 'battersTableToggleSaved',
  toggleErrorsId: 'battersTableToggleErrorsSaved',
  toggleDuplicatesId: 'battersTableToggleDuplicatesSaved',
  ...BATTER_NODES
};

const BATTERS_DRAFT = {
  dataType: CUSTOM_DATA_TYPES.BATTER,
  columns: BatterKeys,
  storageKey: STORAGE_KEYS.customBatterData,
  feedbackNodeId: 'battersToSaveFeedback',
  tableNodeId: 'battersTableDraft',
  previewNodeId: 'battersTablePreviewDraft',
  completeNodeId: 'battersTableCompleteDraft',
  errorNodeId: 'battersTableErrorDraft',
  footerNodeId: 'battersTableFooterDraft',
  toggleNodeId: 'battersTableToggleDraft',
  toggleErrorsId: 'battersTableToggleErrorsDraft',
  toggleDuplicatesId: 'battersTableToggleDuplicatesDraft',
  ...BATTER_NODES
};

const PITCHERS_SAVED = {
  dataType: CUSTOM_DATA_TYPES.PITCHER,
  columns: PitcherKeys,
  storageKey: STORAGE_KEYS.customPitcherData,
  feedbackNodeId: 'pitchersSavedFeedback',
  tableNodeId: 'pitchersTableSaved',
  previewNodeId: 'pitchersTablePreviewSaved',
  completeNodeId: 'pitchersTableCompleteSaved',
  footerNodeId: 'pitchersTableFooterSaved',
  toggleNodeId: 'pitchersTableToggleSaved',
  toggleErrorsId: 'pitchersTableToggleErrorsSaved',
  toggleDuplicatesId: 'pitchersTableToggleDuplicatesSaved',
  ...PITCHER_NODES
};

const PITCHERS_DRAFT = {
  dataType: CUSTOM_DATA_TYPES.PITCHER,
  columns: PitcherKeys,
  storageKey: STORAGE_KEYS.customPitcherData,
  feedbackNodeId: 'pitchersToSaveFeedback',
  tableNodeId: 'pitchersTableDraft',
  previewNodeId: 'pitchersTablePreviewDraft',
  completeNodeId: 'pitchersTableCompleteDraft',
  errorNodeId: 'pitchersTableErrorDraft',
  footerNodeId: 'pitchersTableFooterDraft',
  toggleNodeId: 'pitchersTableToggleDraft',
  toggleErrorsId: 'pitchersTableToggleErrorsDraft',
  toggleDuplicatesId: 'pitchersTableToggleDuplicatesDraft',
  ...PITCHER_NODES
};

const LIMITS_SAVED = {
  dataType: CUSTOM_DATA_TYPES.LIMIT,
  columns: LimitKeys,
  storageKey: STORAGE_KEYS.customLimitData,
  feedbackNodeId: 'limitsSavedFeedback',
  tableNodeId: 'limitsTableSaved',
  previewNodeId: 'limitsTablePreviewSaved',
  completeNodeId: 'limitsTableCompleteSaved',
  footerNodeId: 'limitsTableFooterSaved',
  toggleNodeId: 'limitsTableToggleSaved',
  toggleErrorsId: 'limitsTableToggleErrorsSaved',
  toggleDuplicatesId: 'limitsTableToggleDuplicatesSaved',
  ...LIMIT_NODES
};

const LIMITS_DRAFT = {
  dataType: CUSTOM_DATA_TYPES.LIMIT,
  columns: LimitKeys,
  storageKey: STORAGE_KEYS.customLimitData,
  feedbackNodeId: 'limitsToSaveFeedback',
  tableNodeId: 'limitsTableDraft',
  previewNodeId: 'limitsTablePreviewDraft',
  completeNodeId: 'limitsTableCompleteDraft',
  errorNodeId: 'limitsTableErrorDraft',
  footerNodeId: 'limitsTableFooterDraft',
  toggleNodeId: 'limitsTableToggleDraft',
  toggleErrorsId: 'limitsTableToggleErrorsDraft',
  toggleDuplicatesId: 'limitsTableToggleDuplicatesDraft',
  ...LIMIT_NODES
};

TO_SAVE_ALL_NODE?.addEventListener('click', (event) => {
  event.preventDefault();
  if (Object.keys(CUSTOM_DATA_TO_SAVE[CUSTOM_DATA_TYPES.BATTER]).length > 0) {
    saveCustomData(CUSTOM_DATA_TYPES.BATTER, BATTERS_DRAFT);
  }
  if (Object.keys(CUSTOM_DATA_TO_SAVE[CUSTOM_DATA_TYPES.PITCHER]).length > 0) {
    saveCustomData(CUSTOM_DATA_TYPES.PITCHER, PITCHERS_DRAFT);
  }
  if (Object.keys(CUSTOM_DATA_TO_SAVE[CUSTOM_DATA_TYPES.LIMIT]).length > 0) {
    saveCustomData(CUSTOM_DATA_TYPES.LIMIT, LIMITS_DRAFT);
  }
});

TO_ABANDON_ALL_NODE?.addEventListener('click', (event) => {
  event.preventDefault();
  clearCustomData(BATTERS_DRAFT);
  clearCustomData(PITCHERS_DRAFT);
  clearCustomData(LIMITS_DRAFT);
});

SAVED_ABANDON_ALL_NODE?.addEventListener('click', (event) => {
  event.preventDefault();
  clearSavedData(BATTERS_SAVED);
  clearSavedData(PITCHERS_SAVED);
  clearSavedData(LIMITS_SAVED);
});

const setDefaultMetrics = async () => {
  const useDefaultMetrics = await getStorageItem(STORAGE_KEYS.defaultMetricsFlag);
  if (useDefaultMetrics) {
    DEFAULT_METRICS_BUTTON?.classList.add('on');
  } else {
    DEFAULT_METRICS_BUTTON?.classList.remove('on');
  }
}

const setDefaultStyling = async () => {
  const useDefaultCss = await getStorageItem(STORAGE_KEYS.defaultStylingFlag);
  if (useDefaultCss) {
    DEFAULT_STYLING_BUTTON?.classList.add('on');
  } else {
    DEFAULT_STYLING_BUTTON?.classList.remove('on');
  }
}

const setFormState = async () => {
  const sheetId = await getStorageItem(STORAGE_KEYS.customSheetId) || '';
  const batterRange = await getStorageItem(STORAGE_KEYS.customBatterRange) || '';
  const pitcherRange = await getStorageItem(STORAGE_KEYS.customPitcherRange) || '';
  const limitRange = await getStorageItem(STORAGE_KEYS.customLimitRange) || '';
  (CONNECT_SHEET_ID_INPUT as HTMLInputElement).value = sheetId.toString();
  (CONNECT_BATTER_RANGE_INPUT as HTMLInputElement).value = batterRange.toString();
  (CONNECT_PITCHER_RANGE_INPUT as HTMLInputElement).value = pitcherRange.toString();
  (CONNECT_LIMIT_RANGE_INPUT as HTMLInputElement).value = limitRange.toString();
  validateInputFields();
  PITCHERS_DRAFT.feedbackNodeId
};

const getSavedData = async () => {
  const savedBatterData = await getStorageItem(STORAGE_KEYS.customBatterData) as StorageObject;
  if (Object.keys(savedBatterData).length > 0) {
    renderSavedData(savedBatterData, BATTERS_SAVED);
  }
  const savedPitcherData = await getStorageItem(STORAGE_KEYS.customPitcherData) as StorageObject;
  if (Object.keys(savedPitcherData).length > 0) {
    renderSavedData(savedPitcherData, PITCHERS_SAVED);
  }
  const savedLimitData = await getStorageItem(STORAGE_KEYS.customLimitData) as StorageObject;
  if (Object.keys(savedLimitData).length > 0) {
    renderSavedData(savedLimitData, LIMITS_SAVED);
  }
}

const clearValidationStates = () => {
  FORM_FEEDBACK?.replaceChildren();
  BATTER_NODES.toSaveFeedbackNode?.replaceChildren();
  PITCHER_NODES.toSaveFeedbackNode?.replaceChildren();
  LIMIT_NODES.toSaveFeedbackNode?.replaceChildren();
  hide(FORM_FEEDBACK);
  hide(DATA_ERROR);
}

setDefaultMetrics();
setDefaultStyling();
setFormState();
getSavedData();

const sanitize = (value: string) => {
  return !value ? undefined : value.trim();
}

const validateInputFields = () => {
  const sheet = sanitize((CONNECT_SHEET_ID_INPUT as HTMLInputElement).value);
  const batterRange = sanitize((CONNECT_BATTER_RANGE_INPUT as HTMLInputElement).value);
  const pitcherRange = sanitize((CONNECT_PITCHER_RANGE_INPUT as HTMLInputElement).value);
  const limitRange = sanitize((CONNECT_LIMIT_RANGE_INPUT as HTMLInputElement).value);
  if (sheet && (batterRange || pitcherRange || limitRange)) {
    CONNECT_BUTTON?.removeAttribute('disabled');
  } else {
    CONNECT_BUTTON?.setAttribute('disabled', 'disabled');
  }
}

CONNECT_BATTER_RANGE_INPUT?.addEventListener('keyup', validateInputFields);
CONNECT_PITCHER_RANGE_INPUT?.addEventListener('keyup', validateInputFields);
CONNECT_LIMIT_RANGE_INPUT?.addEventListener('keyup', validateInputFields);
CONNECT_SHEET_ID_INPUT?.addEventListener('keyup', validateInputFields);

DEFAULT_METRICS_BUTTON?.addEventListener('click', (event) => {
  event.preventDefault();
  getCurrentTab().then(tab => {
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

DEFAULT_STYLING_BUTTON?.addEventListener('click', (event) => {
  event.preventDefault();
  getCurrentTab().then(tab => {
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

// TODO: Button can start spinning and getSheetData doesn't return anything if 
// authentication window is closed. Need a timeout
CONNECT_FORM?.addEventListener('submit', (event) => {
  event.preventDefault();
  submitConnectForm();
});

const submitConnectForm = async () => {
  clearValidationStates();
  const sheetId = sanitize((CONNECT_SHEET_ID_INPUT as HTMLInputElement).value);
  if (!sheetId) return;
  const batterRange = sanitize((CONNECT_BATTER_RANGE_INPUT as HTMLInputElement).value);
  const pitcherRange = sanitize((CONNECT_PITCHER_RANGE_INPUT as HTMLInputElement).value);
  const limitRange = sanitize((CONNECT_LIMIT_RANGE_INPUT as HTMLInputElement).value);
  await setStorageItem(STORAGE_KEYS.customSheetId, sheetId || '');
  await setStorageItem(STORAGE_KEYS.customBatterRange, batterRange || '');
  await setStorageItem(STORAGE_KEYS.customPitcherRange, pitcherRange || '');
  await setStorageItem(STORAGE_KEYS.customLimitRange, limitRange || '');
  spin(CONNECT_BUTTON);
  if (batterRange) {
    await getSheetData(sheetId, batterRange, CUSTOM_DATA_TYPES.BATTER, writeData, writeError);
  }
  if (pitcherRange) {
    await getSheetData(sheetId, pitcherRange, CUSTOM_DATA_TYPES.PITCHER, writeData, writeError);
  }
  if (limitRange) {
    await getSheetData(sheetId, limitRange, CUSTOM_DATA_TYPES.LIMIT, writeData, writeError);
  }
};

const writeError = (response: { error: Error }) => {
  unspin(CONNECT_BUTTON);
  validateInputFields();
  const h = renderElement({
    tag: 'h3',   
    text: 'Error on connect',   
  });
  const p = renderElement({
    tag: 'p', 
    css: ['error'],
  });
  const errorMessage = response.error?.message ? response.error.message : 'Unknown error';
  const msg = document.createTextNode(errorMessage);
  p.append(msg);
  FORM_FEEDBACK?.replaceChildren(h, p);
  show(FORM_FEEDBACK);
};

const renderDataTable = (
  customDataObject: ValidationObject | StorageObject,
  customTableRecord: CustomTableRecord,
  hideErrors = false,
) => {
  const { 
    tableNodeId, 
    previewNodeId, 
    completeNodeId, 
    footerNodeId, 
    toggleNodeId, 
    toggleErrorsId, 
    toggleDuplicatesId, 
    dataType 
  } = customTableRecord;
  const tableColumns = dataType === CUSTOM_DATA_TYPES.BATTER 
    ? BatterKeys : dataType === CUSTOM_DATA_TYPES.PITCHER 
      ? PitcherKeys : LimitKeys;
  const table = renderElement({ tag: 'table', id: tableNodeId });
  const thead = renderElement({ tag: 'thead' });
  const thr = renderElement({tag: 'tr'});
  const keyString = dataType === CUSTOM_DATA_TYPES.LIMIT
    ? translation.limits as KeyString 
    : translation.players as KeyString;
  tableColumns.forEach((col) => {
    const cssClass = 'grid-' + col.toLowerCase();
    const th = renderElement({
      tag: 'th',
      css: [cssClass],
    });
    const cell = renderElement({
      tag: 'span',
      text: keyString[col],
    });
    th.append(cell);
    thr.append(th);
  });
  thead.append(thr);
  const tbodyPreview = renderElement({
    tag: 'tbody', 
    id: previewNodeId,
  });
  const tbodyComplete = renderElement(
    { tag: 'tbody', 
    css: ['hide'], 
    id: completeNodeId,
  });
  const customDataValues = Object.values(customDataObject);
  const previewRows = 1;
  let hasErrors = false;
  let hasDuplicates = false;
  let rowCount = 0;
  customDataValues.forEach((entry) => {
    const idEntry = entry[tableColumns[0]];
    if (hideErrors && typeof idEntry === 'object' && idEntry.error) return;
    rowCount++;
    let rowErrCssClass = '';
    if (typeof idEntry === 'object' && idEntry.error) {
      rowErrCssClass = 'error';
      hasErrors = true;
      if (idEntry.error === VALIDATIONS.DUPLICATE_ID) {
        hasDuplicates = true;
      }
    }
    const tr = renderElement({
      tag: 'tr',
      css: [rowErrCssClass],
    });
    tableColumns.forEach((col) => {
      let columnEntry, errorText, errorCssClass = '';
      if (typeof entry[col] === 'object') {
        columnEntry = entry[col].value;
        errorText = (translation.errors as KeyString)[entry[col].error];
        errorCssClass = entry[col].error && entry[col].error !== VALIDATIONS.INVALID_ROW ? 'error' : '';
      } else {
        columnEntry = entry[col];
      }
      const cssClass = 'grid-' + col.replace(/\s+/g, '').toLowerCase();
      const td = renderElement({
        tag: 'td',
        css: [cssClass, errorCssClass],
      });
      const cell = renderElement({
        tag: 'span',
        css: ['entry'],
        text: columnEntry,
      });
      td.append(cell);
      if (errorCssClass) {
        const tt = tooltip({ 
          css: ['tooltip-cellular'],
          type: 'error',
          look: 'filled',
          shape: 'square',
          tooltip: `${errorText}`
        }) as ElementDefinition;
        const errorElement = renderTree(tt);
        td.append(errorElement);
      }
      tr.append(td);
    });
    if (rowCount <= previewRows) {
      const trp = tr.cloneNode(true);
      tbodyPreview.append(trp);
    };
    tbodyComplete.append(tr);
  });
  const needsPreview = rowCount > previewRows;
  table.replaceChildren(
    thead,
    tbodyPreview,
    tbodyComplete,
  );
  if (hideErrors || hasErrors || needsPreview) {
    const actionList = [];
    if (needsPreview) {
      const expandTable: ElementDefinition = {
        tag: 'a',
        attr: [{ name: 'role', value: 'button' }],
        css: ['action'],
        text: 'Expand table',
        id: toggleNodeId,
      }
      const expandTableAction: ElementDefinition = {
        tag: 'span',
        css: ['action'],
        children: [expandTable],
        style: { display: "inline-block" },
      }
      actionList.push(expandTableAction);
    }
    if (hasErrors || hideErrors) {
      const hideErrorsText = hideErrors ? translation.options.showErrorsAction : translation.options.hideErrorsAction;
      const hideErrorsState = hideErrors ? 'show' : 'hide';
      const hideErrorsAction: ElementDefinition = {
        tag: 'a',
        attr: [
          { name: 'role', value: 'button' },
          { name: 'data-state', value: hideErrorsState },
        ],
        css: ['action'],
        text: hideErrorsText,
        id: toggleErrorsId,
      };
      const hideErrorsActionWrapper: ElementDefinition = {
        tag: 'span',
        css: ['action'],
        children: [hideErrorsAction],
        style: { display: "inline-block" },
      }  
      actionList.push(hideErrorsActionWrapper);
    }
    if (hasDuplicates) {
      const removeDuplicatesAction: ElementDefinition = {
        tag: 'a',
        attr: [{ name: 'role', value: 'button' }],
        css: ['action'],
        text: translation.options.removeDuplicatesAction,
        id: toggleDuplicatesId,
      };
      const hideDuplicatesActionWrapper: ElementDefinition = {
        tag: 'span',
        css: ['action'],
        children: [removeDuplicatesAction],
        style: { display: "inline-block" },
      }
      actionList.push(hideDuplicatesActionWrapper);
    }
    const inlineActions: ElementDefinition = {
      tag: 'span',
      children: actionList,
      css: ['inline-actions'],
    };
    const tfoot = renderElement({ tag: 'tfoot', css: ['zebra'], id: footerNodeId });
    const tftr = renderElement({ tag: 'tr' });
    const tftrth = renderElement({ tag: 'td', attr: [{ name: 'colspan', value: BatterKeys.length.toString() }] });
    const tfa = renderTree(inlineActions);
    tftrth.append(tfa);
    tftr.append(tftrth);
    tfoot.append(tftr);
    table.append(tfoot);
  }
  return { dataTable: table, hasErrors: hasErrors};
}

const addTableActions = (
  customTableRecord: CustomTableRecord,
  customDataObject: StorageObject | ValidationObject,
  zebraClass: string
) => {
  const { 
    previewNodeId, 
    completeNodeId, 
    footerNodeId, 
    toggleNodeId, 
    toggleErrorsId = '',
    toggleDuplicatesId = '' 
  } = customTableRecord;
  const previewNode = document.getElementById(previewNodeId);
  const completeNode = document.getElementById(completeNodeId);
  const tfootNode = document.getElementById(footerNodeId);
  const toggleActionElement = document.getElementById(toggleNodeId);
  const toggleErrorsElement = document.getElementById(toggleErrorsId);
  const toggleDuplicatesElement = document.getElementById(toggleDuplicatesId);
  activateTooltips(customTableRecord.tableNodeId);
  if (toggleActionElement) {
    toggleActionElement.addEventListener('click', (event) => {
      event.preventDefault();
      if (previewNode?.classList.contains('hide')) {
        show(previewNode);
        hide(completeNode);
        tfootNode?.classList.add('zebra');
        toggleActionElement.innerText = 'Expand table';
      } else {
        hide(previewNode);
        show(completeNode);
        tfootNode?.classList.remove('zebra');
        if (zebraClass) {
          tfootNode?.classList.add(zebraClass);
        }
        toggleActionElement.innerText = 'Collapse table';
      }
    });
  }
  toggleErrorsElement?.addEventListener('click', (event) => {
    event.preventDefault();
    if (toggleErrorsElement.getAttribute('data-state') === 'hide') {
      renderDraftData(customTableRecord.dataType, customDataObject, customTableRecord, true);
    } else {
      renderDraftData(customTableRecord.dataType, customDataObject, customTableRecord);      
    }
  });
  toggleDuplicatesElement?.addEventListener('click', (event) => {
    event.preventDefault();
    // hideErrors should be false, but check anyway for robustness
    const hideErrors = toggleErrorsElement?.getAttribute('data-state') === 'hide';
    const { validData, filteredData } = getValidData(customDataObject as ValidationObject, customTableRecord, true);
    if (Object.keys(validData).length < 1) {
      const dataName = (translation.customDataTypes as KeyString)[customTableRecord.dataType];
      throw Error(`invalidData${dataName}`);
    }
    CUSTOM_DATA_TO_SAVE[customTableRecord.dataType] = { ...validData };
    renderDraftData(customTableRecord.dataType, filteredData, customTableRecord, !hideErrors);
  });
}

const writeData = (
  customData: SheetRange, 
  dataType: string
) => {
  unspin(CONNECT_BUTTON);
  validateInputFields()
  const h = renderElement({
    tag: 'h3',
    text: 'Connection successful',
  })
  FORM_FEEDBACK?.replaceChildren(h);
  show(FORM_FEEDBACK);
  
  try {
    const DRAFT = dataType === CUSTOM_DATA_TYPES.BATTER ? BATTERS_DRAFT : 
      dataType === CUSTOM_DATA_TYPES.PITCHER ? PITCHERS_DRAFT : LIMITS_DRAFT;
    // Each sheet is handled individually based on dataType
    const { dataObject, fatalError } = createDataObject(customData, DRAFT.columns, dataType);
    if (fatalError) {
      throw Error(fatalError);
    }
    const { validData } = getValidData(dataObject, DRAFT);
    if (Object.keys(validData).length < 1) {
      const dataName = (translation.customDataTypes as KeyString)[dataType];
      throw Error(`invalidData${dataName}`);
    }
    CUSTOM_DATA_TO_SAVE[dataType] = { ...validData };
    renderDraftData(dataType, dataObject, DRAFT);
  } catch (err) {
    let errorText = '';
    if (err instanceof Error) {
      console.error(err.name);
      console.error(err.message);
      console.error(err.stack);
      errorText = (translation.errors as KeyString)[err.message];
    } else {
      console.error(err);
      errorText = 'Data handling has failed.';
    }
    const h = renderElement({
      tag: 'h2',
      text: 'Data error',
    });
    const p = renderElement({
      tag: 'p',
      css: ['error'],
      text: errorText,
    });
    DATA_ERROR?.replaceChildren(h, p);
    show(DATA_ERROR);
  }
};

const renderDraftData = (
  dataType: string,
  customDataObject: StorageObject | ValidationObject,
  customTableRecord: CustomTableRecord,
  hideErrors = false,
) => {
  const { dataTable, hasErrors } = renderDataTable(customDataObject, customTableRecord, hideErrors);
  let tt;
  if (hasErrors) {
    tt = tooltip({ 
      type: 'warning',
      shape: 'square',
      tooltip: 'Data has errors. Please expand the data table and inspect all rows. Rows with errors will not be saved.'
    }) as ElementDefinition;
  } else {
    tt = tooltip({ 
      type: 'success',
      shape: 'square',
      look: 'filled',
      tooltip: 'Data is valid. This data is good to go.'
    }) as ElementDefinition;
  }
  const feedbackElement = renderTree(tt);
  customTableRecord.toSaveFeedbackNode?.append(feedbackElement);
  customTableRecord.toSaveTableWrapperNode?.replaceChildren(dataTable);
  renderPreviewTooltips(customTableRecord.previewNodeId);
  const rowsLength = Object.keys(customDataObject).length;
  const zebra = rowsLength % 2 === 0 ? '' : 'zebra';
  addTableActions(customTableRecord, customDataObject, zebra);
  undisable(customTableRecord.toSaveButtonNode);
  customTableRecord.toSaveButtonNode?.addEventListener('click', (event) => {
    event.preventDefault();
    saveCustomData(dataType, customTableRecord);
  });
  customTableRecord.toSaveAbandonButtonNode?.addEventListener('click', (event) => {
    event.preventDefault();
    clearCustomData(customTableRecord);
  });
  if (!SAVED_DATA?.classList.contains('hide')) {
    show(OVERWRITE_WARNING);     
  } else {
    hide(OVERWRITE_WARNING);
  }
  show(DATA_TO_SAVE);
  show(customTableRecord.toSaveNode);
  show(customTableRecord.toSaveTableWrapperNode);
  activateTooltips(customTableRecord.feedbackNodeId);
}

const saveCustomData = async (
  customDataKey: string,
  customTableRecord: CustomTableRecord
) => {
  spin(customTableRecord.toSaveButtonNode);
  spin(TO_SAVE_ALL_NODE);
  spin(TO_ABANDON_ALL_NODE);
  const customDataObject = CUSTOM_DATA_TO_SAVE[customDataKey]  
  await setStorageItem(customTableRecord.storageKey, customDataObject);
  const response = await applyCustomMetrics();
  switch (response) {
    case UPDATE_METRICS:
      show(UPDATE_WARNING);
      break;
    default: 
      hide(UPDATE_WARNING);
  }
  unspinreset(customTableRecord.toSaveButtonNode);
  unspinreset(TO_SAVE_ALL_NODE);
  unspinreset(TO_ABANDON_ALL_NODE);
  FORM_FEEDBACK?.replaceChildren();
  hide(FORM_FEEDBACK);
  hide(customTableRecord.toSaveNode);
  hide(customTableRecord.toSaveTableWrapperNode);
  CUSTOM_DATA_TO_SAVE[customTableRecord.dataType] = {};
  if (BATTERS_DRAFT.toSaveNode?.classList.contains('hide') 
    && PITCHERS_DRAFT.toSaveNode?.classList.contains('hide')
    && LIMITS_DRAFT.toSaveNode?.classList.contains('hide')) {
      hide(DATA_TO_SAVE);
  }
  const savedDataRecord = customDataKey === CUSTOM_DATA_TYPES.BATTER 
  ? BATTERS_SAVED : customDataKey === CUSTOM_DATA_TYPES.PITCHER 
    ? PITCHERS_SAVED : LIMITS_SAVED;
  renderSavedData(customDataObject, savedDataRecord);
}

const renderSavedData = (
  customDataObject: StorageObject | ValidationObject, 
  customTableRecord: CustomTableRecord,
) => {
  customTableRecord.savedTableWrapperNode?.replaceChildren();
  show(SAVED_DATA);
  show(customTableRecord.savedNode);
  show(customTableRecord.savedTableWrapperNode);
  const { dataTable } = renderDataTable(customDataObject, customTableRecord);
  customTableRecord.savedTableWrapperNode?.replaceChildren(dataTable);
  const zebra = Object.keys(customDataObject).length % 2 === 0 ? '' : 'zebra';
  addTableActions(customTableRecord, customDataObject, zebra);
  customTableRecord.savedAbandonButtonNode?.addEventListener('click', (event) => {
    event.preventDefault();
    clearSavedData(customTableRecord);
  });
}

const clearCustomData = async(customTableRecord: CustomTableRecord) => {
  hide(customTableRecord.toSaveNode);
  hide(customTableRecord.toSaveTableWrapperNode);
  CUSTOM_DATA_TO_SAVE[customTableRecord.dataType] = {};
  if (
    BATTERS_DRAFT.toSaveNode?.classList.contains('hide') 
    && PITCHERS_DRAFT.toSaveNode?.classList.contains('hide')
    && LIMITS_DRAFT.toSaveNode?.classList.contains('hide')
  ) {
    hide(DATA_TO_SAVE);
  }
  const h = renderElement({
    tag: 'h3',   
    text: 'Reconnect to retrieve data',
  });
  FORM_FEEDBACK?.replaceChildren(h);
  show(FORM_FEEDBACK);
  customTableRecord.toSaveTableWrapperNode?.replaceChildren();
}

const clearSavedData = async (customTableRecord: CustomTableRecord) => {
  hide(customTableRecord.savedNode);
  hide(customTableRecord.savedTableWrapperNode);
  if (
    BATTERS_SAVED.savedNode?.classList.contains('hide')
    && PITCHERS_SAVED.savedNode?.classList.contains('hide')
    && LIMITS_SAVED.savedNode?.classList.contains('hide')
  ) {
    hide(SAVED_DATA);
    hide(OVERWRITE_WARNING);
    hide(UPDATE_WARNING);
  }
  customTableRecord.savedTableWrapperNode?.replaceChildren();
  await resetStorageItem(customTableRecord.storageKey);
  await applyCustomMetrics();
}

DISCONNECT_BUTTON?.addEventListener('click', (event) => {
  event.preventDefault();
  hide(DATA_ERROR);
  spin(DISCONNECT_BUTTON);
  disconnect(disconnectSuccess, disconnectError);
});

const disconnectSuccess = (response = 'Token revoked.') => {
// Disconnect should short-circuit a connect in progress
// In addition to changing button state, need to set a state variable for
// the return of the API call
  unspin(CONNECT_BUTTON);
  validateInputFields();
  unspin(DISCONNECT_BUTTON);
  const h = renderElement({
    tag: 'h3',   
    text: 'Disconnect success',   
  });
  const p = renderElement({
    tag: 'p',
    text: response,
  });
  FORM_FEEDBACK?.replaceChildren(h, p);
  show(FORM_FEEDBACK);
}

const disconnectError = (response = 'Unknown error.') => {
// Disconnect should short-circuit a connect in progress
// In addition to changing button state, need to set a state variable for
// the return of the API call
  unspin(CONNECT_BUTTON);
  validateInputFields();
  unspinreset(DISCONNECT_BUTTON);
  const h = renderElement({
    tag: 'h3',   
    text: 'Disconnect error',   
  });
  const p = renderElement({
    tag: 'p',
    css: ['error'],
    text: response,
  });
  FORM_FEEDBACK?.replaceChildren(h, p);
  show(FORM_FEEDBACK);
}

chrome.runtime.onMessage.addListener(async (request) => {
  await handlePopupMessaging(request);
});

const handlePopupMessaging = (request: EventMessage) => {
  switch (request.message) {
    case UPDATE_METRICS:
      setDefaultMetrics();
      break;
    case UPDATE_STYLES:
      setDefaultStyling();
      break;
  }
}
