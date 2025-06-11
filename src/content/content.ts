/*
import { addPlayerTags } from './content/actors/playerTags';
import { observePlayerMoves } from './content/observers/playerObserver';
import { UPDATE_METRICS } from '../lib/constants.ts';

addPlayerTags();
observePlayerMoves();

// chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
chrome.runtime.onMessage.addListener(async (request) => {
  switch (request.message as string) {
    case UPDATE_METRICS:
      await addPlayerTags();
    break;
  }
});
*/