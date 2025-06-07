import { getStorageItem, STORAGE_KEYS } from '../../lib/storage';
import * as selectors from '../../lib/selectors';
import * as switches from '../../lib/switches';
import { 
  GameInfo,
  ParkFactorsObject, 
  Batter, 
  LimitObject,
  ElementDefinition,
  Quintiles,
  BatterObject,
  PitcherObject,
} from '../../lib/types';
import { 
  TEAMS, 
  ROSTER_ORGANIZER, 
  SET_LINEUPS, 
  DEFAULT_BATTER,
  LEAGUE_LHBvLHP,
  LEAGUE_RHBvLHP,
  LEAGUE_LHBvRHP,
  LEAGUE_RHBvRHP,
} from '../../lib/constants';
import { 
  stringClamp, 
  getBrightnessFromColorString, 
  getAggregate,
  getPitcherImpact,  
  getBatterSplit,
  getPitcherSplit,
  getParkSplit,
  getParkFactor,
  createColorRange,
  mergeCustomData,
} from '../../lib/utilities';
import {
  renderTree
} from '../../lib/renders';
import * as colors from '../../lib/colors';
import { iconButton } from '../../components/icons';

const removePlayerTag = (playerNode?: Element) =>
  playerNode.classList.remove('batcast-player-name-cell');

const removeAllPlayerTags = () => {
  const modifiedNodes = document.querySelectorAll(selectors.LINEUP_TABLE_MODIFIED_PLAYERS);
  modifiedNodes.forEach(eachNode => removePlayerTag(eachNode));
};

const toggle = (node: HTMLElement, target: HTMLElement) => {
  if (!target) return;
  if (target.classList.contains('batcast-show')) {
    node.classList.remove('batcast-on');
    target.classList.remove('batcast-show');
    target.classList.add('batcast-hide');
  } else {
    node.classList.add('batcast-on');
    target.classList.remove('batcast-hide');
    target.classList.add('batcast-show');
  }
}

const defineParkSplit = (gameInfo: GameInfo) => {
  const vsParkSplit: ElementDefinition = {
    tag: 'strong',
    text: getParkSplit(gameInfo)
  };
  const vsParkSplitLabel: ElementDefinition = {
    tag: 'span',
    text: ' PF'
  };
  const vsPark: ElementDefinition = {
    tag: 'span',
    css: [ 'batcast-aggregate-vs-park' ],
    children: [ vsParkSplit, vsParkSplitLabel ]        
  };
  return vsPark;
};

const renderBatter = (
  batterElement: Element,
  batter: Batter,
  limitData: LimitObject,
  gameInfo: GameInfo,
  quintiles: Quintiles, 
) => {
  batterElement.classList.add('batcast-player-name-cell', 'batcast-aggregate-cell');
  
  const oldBatterTag = batterElement.querySelector('.batcast-player-tag')
  if (oldBatterTag) oldBatterTag.remove();

  const batterMin = limitData.BOBA.Min;
  const batterMax = limitData.BOBA.Max;

  let vsPitcherText;

  if (gameInfo.pitcherType) {
    const b1 = batter['q1'].split(' ');
    const b2 = batter['q2'].split(' ');
    const b3 = batter['q3'].split(' ');
    const b4 = batter['q4'].split(' ');
    const b5 = batter['q5'].split(' ');
// Based on pitcher Type match, modify batter.vsRHP && batter.vsLHP
    const bAll = [...b1, ...b2, ...b3, ...b4, ...b5];
    if (bAll.includes(gameInfo.pitcherType)) {
      vsPitcherText = ` vs ${gameInfo.pitcherType}`;
      if (b1.includes(gameInfo.pitcherType)) {
        batter.vsRHP = quintiles['q1'];
        batter.vsLHP = quintiles['q1'];
      } else if (b2.includes(gameInfo.pitcherType)) {
        batter.vsRHP = quintiles['q2'];
        batter.vsLHP = quintiles['q2'];
      } else if (b3.includes(gameInfo.pitcherType)) {
        batter.vsRHP = quintiles['q3'];
        batter.vsLHP = quintiles['q3'];
      } else if (b4.includes(gameInfo.pitcherType)) {
        batter.vsRHP = quintiles['q4'];
        batter.vsLHP = quintiles['q4'];
      } else if (b5.includes(gameInfo.pitcherType)) {
        batter.vsRHP = quintiles['q5'];
        batter.vsLHP = quintiles['q5'];
      }
    }
  }

  if (batter.wOBA && batter.Bats) {
    const wOBANum = Number(batter.wOBA);
    const vsLHPc = batter.Bats === "L" ? wOBANum * LEAGUE_LHBvLHP : wOBANum * LEAGUE_RHBvLHP;
    const vsRHPc = batter.Bats === "R" ? wOBANum * LEAGUE_RHBvRHP : wOBANum * LEAGUE_LHBvRHP;
    batter.vsLHPc = vsLHPc.toFixed(3);
    batter.vsRHPc = vsRHPc.toFixed(3);
  }

  const elAggregateBase: ElementDefinition = {
    tag: 'span',
    css: ['batcast-aggregate-base'],
  }

  const elAggregate: ElementDefinition = {
    id: `batcast-aggregate-${batter.OttoneuID}`,
    tag: 'span',
    css: ['batcast-aggregate', 'batcast-player-tag'],
    children: [elAggregateBase]
  }

  const aggregate = getAggregate(batter, gameInfo, limitData);
  const hasParkFactor = gameInfo?.gameParkRank?.parkFactor;
  let baggY = 1, baggTextColor, baggBorderColor, baggColor, baggClass;

  if (aggregate) {
    const batterAggregate = stringClamp(aggregate, batterMin, batterMax, 3);
    baggColor = limitData.BOBA.ColorRange[batterAggregate];
    baggY = getBrightnessFromColorString(baggColor);
    baggBorderColor = baggY > .95 ? colors.TAG_BORDER_INVERSE : baggColor;
    baggTextColor = baggY < 0.6 ? colors.TAG_TEXT_INVERSE : colors.TAG_TEXT;
    baggClass = `batcast-aggregate-${batterAggregate.slice(2)}`;
    elAggregateBase.text = batterAggregate.slice(1);
  } else if (batter['wOBA'] || gameInfo.pitcherArm) {
    elAggregateBase.text = batter['wOBA'] ? batter['wOBA'].slice(1) : 'NA';
    baggColor = batter['wOBA'] ? 'transparent' : colors.TAG_BACKGROUND_COLOR_NA_ACTIVE;
    baggTextColor = colors.TAG_TEXT;
    baggBorderColor = colors.TAG_BORDER_COLOR_NA_ACTIVE;
    baggClass = batter['wOBA'] ? 'batcast-woba' : 'batcast-aggregate-na-active';
  } else {
    elAggregateBase.text = 'NA';
    baggColor = colors.TAG_BACKGROUND_COLOR_NA;
    baggTextColor = colors.TAG_COLOR_NA;
    baggBorderColor = colors.TAG_BORDER_COLOR_NA;
    baggClass = 'batcast-aggregate-na';
  }

  elAggregate.style = {
    color: baggTextColor,
    borderColor: baggBorderColor,
    backgroundColor: baggColor    
  }
  elAggregate.css.push(baggClass);

  // TODO add custom css or element to indicate confidence for batter and/or pitcher splits
  if (gameInfo.pitcherArm) {
    const orderText = gameInfo.batterOrder.includes('Batting') ? gameInfo.batterOrder.slice(8) : '';
    const orderCss = gameInfo.batterOrder
      ? gameInfo.batterOrder === 'Not starting'
        ? 'batcast-aggregate-order-x'
        : 'batcast-aggregate-order-starting'
      : 'batcast-aggregate-order-na';
    const orderTextColor = baggY < 0.6 ? colors.TAG_TEXT : colors.TAG_TEXT_INVERSE;
    const orderTextBackgroundColor = baggY < 0.6 ? colors.TAG_TEXT_INVERSE : colors.TAG_TEXT;
    const maskClass = baggY < 0.6 ? 'batcast-mask-inverse' : 'batcast-mask'
    const battingOrder: ElementDefinition = {
      tag: 'span',
      css: [ 'batcast-aggregate-order', orderCss ],
      text: orderText,
      style: {
        color: orderTextColor,
        backgroundColor: orderTextBackgroundColor
      }
    };
    const vsPitcherSplit: ElementDefinition = {
      tag: 'strong',
      text: aggregate ? getBatterSplit(batter, gameInfo).toFixed(3) : '???'
    };
    const vsPitcherSplitLabel: ElementDefinition = {
      tag: 'span',
      text: vsPitcherText || ` vs ${gameInfo.pitcherArm}HP`,
    };
    const vsPitcher: ElementDefinition = {
      tag: 'span',
      css: [ 'batcast-aggregate-vs-pitcher' ],
      children: [ vsPitcherSplit, vsPitcherSplitLabel ]        
    };
    const vsBatterSplit: ElementDefinition = {
      tag: 'strong',
      text: getPitcherSplit(gameInfo)
    };
    const batterSide =  (gameInfo.batterSide === 'L' || (gameInfo.batterSide === 'S' && gameInfo.pitcherArm === 'R')) 
      ? ' vs LHB'
      : ' vs RHB';
    const vsBatterSplitLabel: ElementDefinition = {
      tag: 'span',
      text: batterSide
    };
    const vsBatter: ElementDefinition = {
      tag: 'span',
      css: [ 'batcast-aggregate-vs-batter' ],
      children: [ vsBatterSplit, vsBatterSplitLabel ]
    };
    const vsPark = defineParkSplit(gameInfo);
    const splitsBlock: ElementDefinition = {
      id: `batcast-aggregate-extended-${batter.OttoneuID}`,
      tag: 'span',
      css: [ 'batcast-aggregate-extended' ],
      children: [ battingOrder, vsPitcher, vsPark, vsBatter ],
      attr: [{ name: 'data-batter-id', value: batter.OttoneuID}],
      style: {
        color: baggTextColor,
        borderColor: baggBorderColor,
        backgroundColor: baggColor,
      }
    };
    if (switches.HAS_SCENARIO) {
      const scenarioAction: ElementDefinition = iconButton({ name: 'settings', css: [ maskClass ] });
      const scenarioReset: ElementDefinition = iconButton({ name: 'reset', css: [ maskClass, 'batcast-disabled' ] });
      splitsBlock.children.push(scenarioAction, scenarioReset);
    }
    elAggregate.children.push(splitsBlock);
  } else if (batter['wOBA']) {
    const vsLHP: ElementDefinition = {
      tag: 'strong',
      text: batter.vsLHP ? batter.vsLHP.slice(1) : batter.vsLHPc.slice(1)
    }
    const vsLHPLabel: ElementDefinition = {
      tag: 'span',
      text: ' vs LHP'
    };
    const vsLHPSplit: ElementDefinition = {
      tag: 'span',
      css: ['batcast-woba-vslhp'],
      children: [ vsLHP, vsLHPLabel]
    }
    const vsRHP: ElementDefinition = {
      tag: 'strong',
      text: batter.vsRHP ? batter.vsRHP.slice(1) : batter.vsRHPc.slice(1)
    }
    const vsRHPLabel: ElementDefinition = {
      tag: 'span',
      text: ' vs RHP'
    };
    const vsRHPSplit: ElementDefinition = {
      tag: 'span',
      css: ['batcast-woba-vsrhp'],
      children: [ vsRHP, vsRHPLabel]
    };
    const vsPark = hasParkFactor ? defineParkSplit(gameInfo) : null;
    const extendedCssClass = hasParkFactor ? 'batcast-pf-extended' : null;
    // TODO: Move this to a function to handle redundant logic
    const splitsBlock: ElementDefinition = {
      id: `batcast-aggregate-extended-${batter.OttoneuID}`,
      tag: 'span',
      css: [ 'batcast-aggregate-extended', 'batcast-woba-extended', extendedCssClass ],
      children: [ vsLHPSplit, vsRHPSplit, vsPark ],
      attr: [{ name: 'data-batter-id', value: batter.OttoneuID}],
      style: {
        color: colors.TAG_TEXT,
        borderColor: colors.TAG_BORDER_COLOR_NA_ACTIVE,
        backgroundColor: colors.TAG_BACKGROUND_COLOR_NA_ACTIVE,
      }
    };
    if (switches.HAS_SCENARIO) {
      const scenarioAction: ElementDefinition = iconButton({ name: 'settings', label: 'Set scenario' });
      const scenarioReset: ElementDefinition = iconButton({ name: 'reset', label: 'Clear scenario', css: [ 'batcast-disabled' ] });
      splitsBlock.children.push(scenarioAction, scenarioReset);
    }
    elAggregate.children.push(splitsBlock);
  }
  const elAggregateTag = renderTree(elAggregate);
  batterElement.append(elAggregateTag);
  const aggregateNode = document.getElementById(`batcast-aggregate-${batter.OttoneuID}`);
  const aggregateExtendedNode = document.getElementById(`batcast-aggregate-extended-${batter.OttoneuID}`);
  aggregateNode.addEventListener('click', (event) => {
    event.preventDefault();
    toggle(aggregateNode, aggregateExtendedNode);
  });
  // TODO Move this to a separate function and clean up redundant code
  if (switches.HAS_SCENARIO) {
    aggregateNode.querySelectorAll('.batcast-icon-button').forEach((el) => {
      el.addEventListener('click', (event) => {
        const eventNode = event.target as HTMLElement;
        event.preventDefault();
        event.stopPropagation();
        // Move all this into a function
        // Need to "hide" the scenario planner on "show/hide" of the parent element
        const batterId = eventNode.closest('.batcast-aggregate-extended').getAttribute('data-batter-id');
        const scenarioBoxNode = document.getElementById('batcast-scenario-box');
        const { top, right, bottom, left } = eventNode.closest('.batcast-player-tag').getBoundingClientRect();
        scenarioBoxNode.style.top = `${bottom + window.scrollY}px`;
        scenarioBoxNode.style.left = `${left + window.scrollX}px`;
        if (scenarioBoxNode.hasAttribute('data-batter-id')) {
          if (scenarioBoxNode.getAttribute('data-batter-id') === batterId) {
            // Toggle off Scenario Box for current batter
            eventNode.classList.remove('batcast-on');
            scenarioBoxNode.classList.remove('batcast-show');
            scenarioBoxNode.classList.add('batcast-hide');
            scenarioBoxNode.removeAttribute('data-batter-id');
          } else {
            // Move Scenario Box to current Batter
            // Find the node with batterId 
            // oldNode.classList.remove('batcast-on');
            // Also need to save the scenario to repopulate it. Hmmm.
            eventNode.classList.add('batcast-on');
            scenarioBoxNode.classList.add('batcast-show');
            scenarioBoxNode.classList.remove('batcast-hide');
            scenarioBoxNode.setAttribute('data-batter-id', batterId);
          }
        } else {
          // Toggle on Scenario Box for current batter
          // Need a way to populate a saved scenario
          eventNode.classList.add('batcast-on');
          scenarioBoxNode.classList.add('batcast-show');
          scenarioBoxNode.classList.remove('batcast-hide');
          scenarioBoxNode.setAttribute('data-batter-id', batterId);
        }
      });
    });
    // Add a resize handler -- could just hide the box rather than move it.
  }
}

const renderScenarioPlanner = () => {
  if (document.getElementById('batcast-scenario-box')) return;
  const scenarioBox: ElementDefinition = {
    tag: 'div',
    id: 'batcast-scenario-box',
    css: [ 'batcast-scenario', 'batcast-hide'],
  };
  const scenarioBoxTag = renderTree(scenarioBox);
  document.body.append(scenarioBoxTag);
  if (!document.body.classList.contains('batcast-scenario-holder')) {
    document.body.classList.add('batcast-scenario-holder');
  }
}

const renderTags = (
  playerNode: Element, 
  batterData: BatterObject,
  pitcherData: PitcherObject,
  limitData: LimitObject,
  pFL: ParkFactorsObject, 
  pFR: ParkFactorsObject,
  page: string,
  quintiles: Quintiles,
) => {
  const batterLink = playerNode.querySelector('a');
  if (!batterLink || batterLink.classList.contains('add_target')) return;

  const playerId = batterLink.id.split('_')[1];
  DEFAULT_BATTER.OttoneuID = playerId;
  const batter = { ...DEFAULT_BATTER, ...batterData[playerId] };
  const pfC = limitData.PF.ColorRange;
  const pfcAvg = limitData.PF.Avg;

  const gameInfo = {
    opponent: '',
    home: true,
    batterOrder: '',
    batterName: batterLink.textContent,
    batterPark: '',
    batterPosition: '',
    batterId: playerId,
    batterLink: batterLink.href,
    batterSalary: '',
    batterSide: '',
    pitcherName: '',
    pitcherId: '',
    pitcherLink: '',
    pitcherArm: '',
    pitcherVsLHB: '',
    pitcherVsRHB: '',
    pitcherType: '',
    gamePark: '',
    gameScore: '',
    gameLink: '',
    gameTime: '',
    gameParkRank: {
      parkFactor: pfcAvg,
      parkFactorColor: pfC[pfcAvg],
    }
  }

  // No pitcher or park
  if (page === ROSTER_ORGANIZER) {
    renderBatter(playerNode, batter, limitData, gameInfo, quintiles);
    return;
  }

  const playerBio = playerNode.querySelector('.lineup-player-bio');
  const playerDetails = playerBio.querySelector('.tinytext');
  const playerArray = playerDetails.innerHTML.split('&nbsp;');
  const homePark = playerArray[0];
  const position = playerArray[1];
  const handedness = playerArray[2];

  gameInfo.batterPark = homePark;
  gameInfo.batterPosition = position;
  gameInfo.batterSide = handedness;

  const lineupNode = playerNode.querySelector('.lineup-game-info');
  const gameElementContent = lineupNode ? lineupNode.textContent : null;
  if (gameElementContent) {
    const sr = lineupNode.querySelector('.sr-only');
    if (sr) {
      gameInfo.batterOrder = sr.textContent;
    }
    const awayCheck = gameElementContent.indexOf('@');
    gameInfo.home = awayCheck < 0;
    if (awayCheck > -1) {
      const opponentPark = gameElementContent.slice(awayCheck + 1, awayCheck + 4)
      gameInfo.gamePark = opponentPark;
      gameInfo.opponent = opponentPark;
    } else {
      const possiblePark = gameElementContent.slice(0, 3);
      gameInfo.gamePark = homePark.slice(0, 3);
      if (possiblePark in TEAMS) {
        gameInfo.opponent = possiblePark;
      } else {
        const alternatePossibleParkIndex = gameElementContent.indexOf('\xa0');
        if (alternatePossibleParkIndex > -1) {
          gameInfo.opponent = gameElementContent.slice(alternatePossibleParkIndex + 1, alternatePossibleParkIndex + 4);
        }
      }
    }
    if (gameInfo.opponent) {
      const gameScore = lineupNode.querySelector('a[href*="liveboxscore.aspx"]') as HTMLAnchorElement;
      const opponentIndex = gameElementContent.indexOf(gameInfo.opponent);
      if (gameScore) {
        gameInfo.gameScore = gameScore.textContent.trim();
        gameInfo.gameLink = gameScore.href
      } else {
        gameInfo.gameTime = gameElementContent.slice(opponentIndex + 4).trim();
      }
      const pitcherLink = lineupNode.parentNode.querySelector('a[href*="players"]') as HTMLAnchorElement;
      if (pitcherLink) {
        gameInfo.pitcherName = pitcherLink.textContent;
        gameInfo.pitcherLink = pitcherLink.href;
        gameInfo.pitcherId = pitcherLink.href.split('/').pop();
        const armElement = lineupNode.parentNode.querySelector('.tinytext');
        if (armElement) {
          gameInfo.pitcherArm = armElement.textContent;
        }
        const pitcher = getPitcherImpact(limitData, pitcherData[gameInfo.pitcherId]);
        gameInfo.pitcherVsRHB = pitcher.pitcherVsRHB;
        gameInfo.pitcherVsLHB = pitcher.pitcherVsLHB;
        gameInfo.pitcherType = pitcher.pitcherType;
      }
    }
  }

  const pf = getParkFactor(gameInfo, limitData, pFL, pFR);

  gameInfo.gameParkRank.parkFactor = pf;
  gameInfo.gameParkRank.parkFactorColor = pfC[pf];

  renderBatter(playerNode, batter, limitData, gameInfo, quintiles);
}

export const addPlayerTags = async (playerNode?: Element) => {
  const useDefaultMetrics = await getStorageItem(STORAGE_KEYS.defaultMetricsFlag);
  const defaultBatterData = await getStorageItem(STORAGE_KEYS.defaultBatterData);
  const defaultPitcherData = await getStorageItem(STORAGE_KEYS.defaultPitcherData);
  const defaultLimitData =  await getStorageItem(STORAGE_KEYS.defaultLimitData);  
  const customBatterData = await getStorageItem(STORAGE_KEYS.customBatterData);
  const customPitcherData = await getStorageItem(STORAGE_KEYS.customPitcherData);
  const customLimitData =  await getStorageItem(STORAGE_KEYS.customLimitData);
  const pFL =  await getStorageItem(STORAGE_KEYS.defaultPFLData);
  const pFR =  await getStorageItem(STORAGE_KEYS.defaultPFRData);

  const applyMetrics = useDefaultMetrics || (Object.keys(customBatterData).length > 0 || Object.keys(customPitcherData).length > 0);

  const page = window.location.href.indexOf(ROSTER_ORGANIZER) > -1
    ? ROSTER_ORGANIZER
    : window.location.href.indexOf(SET_LINEUPS) > -1
      ? SET_LINEUPS
      : null;
    
  if (page && applyMetrics) {
    // Given storage data, cast it to the expected data type
    const batterData = useDefaultMetrics
      ? mergeCustomData(customBatterData, defaultBatterData) as unknown as BatterObject
      : { ...customBatterData } as unknown as BatterObject;
    const pitcherData = useDefaultMetrics
      ? mergeCustomData(customPitcherData, defaultPitcherData) as unknown as PitcherObject
      : { ...customPitcherData } as unknown as PitcherObject;
    const limitData = mergeCustomData(customLimitData, defaultLimitData) as unknown as LimitObject;
    limitData.BOBA.ColorRange = {...createColorRange(limitData.BOBA)};
    limitData.POBA.ColorRange = {...createColorRange(limitData.POBA)};
    limitData.PF.ColorRange = {...createColorRange(limitData.PF)};
    const batterMin = limitData.BOBA.Min;
    const batterMax = limitData.BOBA.Max;    
    const quintile = (Number(batterMax) - Number(batterMin)) / 5;
    const quintiles = {
      'q1' : (Number(batterMax) - quintile).toFixed(3),
      'q2' : (Number(batterMax) - quintile * 2).toFixed(3),
      'q3' : (Number(batterMax) - quintile * 3).toFixed(3),
      'q4' : (Number(batterMax) - quintile * 4).toFixed(3),
      'q5' : (Number(batterMax) - quintile * 5).toFixed(3),
    }
    if (switches.HAS_SCENARIO) {
      renderScenarioPlanner();
    }
    if (playerNode) {
      renderTags(playerNode, batterData, pitcherData, limitData, pFL, pFR,  page, quintiles);
    } else {
      const batterNodes = document.querySelectorAll(selectors.LINEUP_TABLE_BATTERS_NAME);
      batterNodes.forEach(playerNode => {
        renderTags(playerNode, batterData, pitcherData, limitData, pFL, pFR, page, quintiles);
      });
    }
  } else {
    removeAllPlayerTags();
  }
}
