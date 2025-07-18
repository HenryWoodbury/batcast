export const DEFAULT_CSS = '/styles/batcast.css';
export const PLAYERS_CSS = '/styles/players.css';
export const LOADED_CONTENT_SCRIPT = 'ready';
export const UPDATE_METRICS = 'update_metrics_setting';
export const UPDATE_STYLES = 'update_styles';

// Pages, by URL
export const ROSTER_ORGANIZER = 'rosterorganizer';
export const SET_LINEUPS = 'setlineups';

export const LEAGUE_FIP = 4.08;
export const LEAGUE_LHBvLHP = .89;
export const LEAGUE_LHBvRHP = 1.01; 
export const LEAGUE_RHBvLHP = 1.04; 
export const LEAGUE_RHBvRHP = .97; 
export const UNKNOWN_PITCHER_SPLIT = '???';

export const TEAMS = {
  ARI: "Arizona Diamondbacks",
  ATL: "Atlanta Braves",
  BAL: "Baltimore Orioles",
  BOS: "Boston Red Sox",
  CHC: "Chicago Cubs",
  CHW: "Chicago White Sox",
  CIN: "Cincinnati Reds",
  COL: "Colorado Rockies",
  CLE: "Cleveland Guardians",
  DET: "Detroit Tigers",
  HOU: "Houston Astros",
  KCR: "Kansas City Royals",
  LAA: "Los Angeles Angels",
  LAD: "Los Angeles Dodgers",
  MIA: "Miami Marlins",
  MIL: "Milwaukee Brewers",
  MIN: "Minnesota Twins",
  NYM: "New York Mets",
  NYY: "New York Yankees",
  ATH: "Athletics",
  PHI: "Philadelphia Phillies",
  PIT: "Pittsburg Pirates",
  SDP: "San Diego Padres",
  SEA: "Seattle Mariners",
  SFG: "San Francisco Giants",
  STL: "St. Louis Cardinals",
  TBR: "Tampa Bay Rays",
  TEX: "Texas Rangers",
  TOR: "Toronto Blue Jays",
  WSN: "Washington Senators",
}

export const CUSTOM_DATA_TYPES = {
  BATTER: 'batter',
  PITCHER: 'pitcher',
  LIMIT: 'limit',
}

export const LIMIT_IDS = {
  BOBA: 'batter wOBA',
  POBA: 'pitcher wOBA',
  PF: 'park factor',
}

export const BATS = {
  L: 'left',
  R: 'right',
  B: 'both',
}

export const THROWS = {
  L: 'left',
  R: 'right',
}

export const VALIDATIONS = {
  DUPLICATE_ID: 'duplicateId',
  INVALID_COLOR: 'invalidColor',
  INVALID_ID: 'invalidId',
  INVALID_MAX: 'invalidMax',
  INVALID_MIN: 'invalidMin',
  INVALID_RANGE: 'invalidRange',
  INVALID_ROW: 'invalidRow',
  INVALID_ENTRY: 'invalidEntry',
  MISSING_ID: 'missingId',
  REQUIRED: 'required',
  WARNING_RANGE: 'warningRange',
  WARNING_MAX: 'warningMax',
  WARNING_MIN: 'warningMin',
}

export const FEEDBACK_SYMBOLS = {
  "info" : 'i',
  "error" : '!',
  "warning" : '\u26A0',
  "question": '?',
  "success": '\u2713'
}

/* 
Good reference:
https://www.toptal.com/designers/htmlarrows/symbols/

Warning Sign
U+026A0 UNICODE
&#x26A0; HEX CODE
&#9888; HTML CODE
\26A0

Baseball
U+026BE UNICODE
&#x26BE; HEX CODE
&#9918; HTML CODE
\26BE

Checkmark
U+02713 UNICODE
&#x2713; HEX CODE
&#10003; HTML CODE
&check; HTML ENTITY
\2713

Line Smiling Face
U+0263A UNICODE
&#x263A; HEX CODE
&#9786; HTML CODE
\263A

Fill Smiling Face
U+0263B UNICODE
&#x263B; HEX CODE
&#9787; HTML CODE
\263B
*/

export const DEFAULT_BATTER = {
  "OttoneuID": '',
  "Name": '',
  "FGID": '',
  "FGMinorID": '',
  "MLBAMID": '',
  "Birthday": '',
  "Positions": '',
  "Bats": '',
  "LastCheck": '',
  "Confidence": '',
  "wOBA": '',
  "vsLHP": '',
  "vsRHP": '',
  "q1": '',
  "q2": '',
  "q3": '',
  "q4": '',
  "q5": '',
}

export const DEFAULT_PITCHER = {
  "OttoneuID": '',
  "Name": '',
  "FGID": '',
  "FGMinorID": '',
  "MLBAMID": '',
  "Birthday": '',
  "Positions": '',
  "Throws": '',
  "LastCheck": '',
  "Confidence": '',
  "FIP": '',
  "vsLHB": '',
  "vsRHB": '',
  "Type": '',
}

export const DEFAULT_LIMIT = {
  "LimitID": '',
  "Factor": '',
  "Min": '',
  "Max": '',
  "Avg": '',
  "Increments": '',
  "MinColor": '',
  "AvgColor": '',
  "MaxColor": '',
  "LeagueAvg": ''
}