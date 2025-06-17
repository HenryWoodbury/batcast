import { addPlayerTags } from './actors/playerTags.ts';
import { observePlayerMoves } from './observers/playerObserver.ts';
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
