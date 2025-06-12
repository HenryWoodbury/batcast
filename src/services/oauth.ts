import {
  type SheetRange, 
  type ErrorType 
} from '../lib/types.ts';

export const getSheetData = (
  sheet: string, 
  range: string,
  tab: string,
  dataCallback: (data: SheetRange, tab: string) => void,
  errorCallback: (response: { error: Error }) => void
) => {
  chrome.identity.getAuthToken({interactive: true}, function(token) {
    const init = {
      method: 'GET',
      async: true,
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      'contentType': 'json'
    };
    // TODO: Abstract this
    try {
      fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheet}/values/${range}`, init)
        .then(response => {
          return response.json();
        })
        .then(data => {
          if (!data.values) {
            errorCallback(data);
          } else {
            dataCallback(data.values, tab);
          }
        });
    } catch(err) {
      if ((err as ErrorType).error) {
        errorCallback(err as ErrorType);
      } else {
        console.error(err);
      }
    }
  });
}

export const disconnect = (
  successCallback: (response: string) => void,
  errorCallback: (response: string) => void
) => {
  chrome.identity.getAuthToken({ interactive: false }, function(token) {
    if (!chrome.runtime.lastError) {
      chrome.identity.removeCachedAuthToken({ token: token as string }, function() { return undefined; });
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "https://accounts.google.com/o/oauth2/revoke?token=" + token);
      xhr.send();
      successCallback('Token revoked and removed from cache. Check chrome://identity-internals to confirm.');
    } else {
      errorCallback(chrome.runtime.lastError.message || '');
    }
  });
}
