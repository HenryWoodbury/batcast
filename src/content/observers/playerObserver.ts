import * as selectors from '../selectors.ts';
import { addPlayerTags } from '../actors/playerTags.ts';

const config = { 
  attributes: true,
  attributeFilter: ['data-position'],
  childList: false, 
  characterData: false, 
  subtree: true
};

// The mutation is triggered by the cells before the move. There is no mutation after the move.
const handlePlayerMove = (mutationList: MutationRecord[]) => {
  if (!chrome.runtime?.id) return;
  for (const mutation of mutationList) {
    if (mutation.type === "attributes") {
      const playerButtonElement = mutation.target.parentElement?.querySelector(selectors.LINEUP_TABLE_BUTTON);
      const playerId = playerButtonElement?.getAttribute('data-player-id');
      if (playerId) {
        const playerSelector = playerButtonElement ? selectors.LINEUP_TABLE_BATTERS_NAME_BY_ID.replace('{id}', playerId) : null;
        if (playerSelector) {
          const playerNode = document.querySelector(playerSelector);
          if (playerNode) {
            addPlayerTags(playerNode);
          }
        }
      }
    }
  }
};

const observerPlayerMoves = new MutationObserver(handlePlayerMove);

export const observePlayerMoves = () => {
  const batterLineupTable = document.querySelector(selectors.LINEUP_TABLE_BATTERS);
  if (batterLineupTable instanceof Element) {
    observerPlayerMoves.observe(batterLineupTable, config);
  } else {
    observerPlayerMoves.disconnect();
  }  
}

/*
Example of console.info(mutation.target):
<td data-player-id="14864" data-position="C" data-player-positions="C" data-is-pitcher="false" data-is-position-player="true" data-is-pitcher-version-of-two-way-player="false" class="lineup__button batter inactive C">C</td>
<td data-position="C" data-is-pitcher="false" data-is-position-player="true" data-is-pitcher-version-of-two-way-player="false" class="lineup__button batter inactive C">C</td>
*/