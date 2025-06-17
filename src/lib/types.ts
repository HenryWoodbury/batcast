export interface Batter {
  "OttoneuID": string;
  "Name": string;
  "FGID": string;
  "FGMinorID": string;
  "MLBAMID": string;
  "Birthday": string;
  "Positions": string;
  "Bats"?: string;
  "Throws"?: string;
  "LastCheck"?: string;
  "Confidence"?: string;
  "wOBA"?: string;
  "vsLHP"?: string;
  "vsRHP"?: string;
  "vsLHPc"?: string;
  "vsRHPc"?: string;
  "q1"?: string;
  "q2"?: string;
  "q3"?: string;
  "q4"?: string;
  "q5"?: string;
}

export interface Pitcher {
  "OttoneuID": string;
  "Name": string;
  "FGID": string;
  "FGMinorID": string;
  "MLBAMID": string;
  "Birthday": string;
  "Positions": string;
  "Bats"?: string;
  "Throws"?: string;
  "LastCheck"?: string;
  "Confidence"?: string;
  "wOBA"?: string;
  "FIP"?: string;
  "vsLHB"?: string;
  "vsRHB"?: string;
  "Type"?: string;
}

export interface KeyString {
  [key: string] : string;
}

export const PlayerKeys = [
  "OttoneuID",
  "Name",
  "FGID",
  "FGMinorID",
  "MLBAMID",
  "Birthday",
  "Positions",
  "Bats",
  "Throws",
  "LastCheck",
  "Confidence",
]

export const BatterKeys = [
  ...PlayerKeys, 
  "wOBA",
  "vsLHP",
  "vsRHP",
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
];

export const PitcherKeys = [
  ...PlayerKeys, 
  "FIP",
  "vsLHB",
  "vsRHB",
  "Type",
];

export const LimitKeys = [
  "LimitID",
  "Factor",
  "Min",
  "Max",
  "Avg",
  "Increments",
  "MinColor",
  "AvgColor",
  "MaxColor",
  "LeagueAvg",
];

export interface ParkFactors {
  "Abbr": string;
  "Team": string;
  "Venue": string;
  "Year": string;
  "ParkFactor": string;
  "wOBACon": string;
  "BACON": string;
  "R": string;
  "OBP": string;
  "H": string;
  "1B": string;
  "2B": string;
  "3B": string;
  "HR": string;
  "BB": string;
  "SO": string;
  "PA": string;
}

export interface Quintiles {
  "q1": string;
  "q2": string;
  "q3": string;
  "q4": string;
  "q5": string;
}

export interface ColorRange {
  [key: string] : string
}

export interface Limit {
  "LimitID": string;
  "Factor": string;
  "Min": string;
  "Max": string;
  "Avg": string;
  "Increments": string;
  "MinColor": string;
  "AvgColor": string;
  "MaxColor": string;
  "ColorRange"?: ColorRange;
  "LeagueAvg": string;
}

export interface GameInfo {
  opponent: string;
  home: boolean,
  batterId: string;
  batterLink: string;
  batterName: string;
  batterOrder: string;
  batterPark: string;
  batterPosition: string;
  batterSalary: string;
  batterSide: string;
  pitcherArm: string;
  pitcherId: string;
  pitcherLink: string;
  pitcherName: string;
  pitcherVsLHB: string;
  pitcherVsRHB: string;
  pitcherType: string;
  gameLink: string;
  gamePark: string;
  gameScore: string;
  gameTime: string;
  gameParkRank: {
    parkFactor: string,
    parkFactorColor: string,
  }
}

export type SheetRange = string[][];

export type ErrorType = { error: Error };

export interface ValidationData {
  [key: string] : { value?: string, error?: string };
}

export interface ValidationObject {
  [key: string] : ValidationData
}

export interface CustomData {
  [key: string] : string | ColorRange;
}

export interface CustomDataObject {
  [key: string] : CustomData
}

export interface StorageData {
  [key: string] : string;
}

export interface StorageObject {
  [key: string] : StorageData
}

export interface BatterObject {
  [key: string] : Batter
};

export interface PitcherObject {
  [key: string] : Pitcher
};

export interface ParkFactorsObject {
  [key: string] : ParkFactors
}

export interface LimitObject {
  [key: string] : Limit
};

export interface EventMessage {
  message: string;
  value?: string | boolean;
}

interface Attributes {
  name: string;
  value: string | undefined;
}

export interface StyleObject {
  [key: string] : string;
}

export interface ElementDefinition {
  tag: string;
  css?: string[];
  id?: string;
  text?: string;
  attr?: Attributes[];
  style?: StyleObject;
  children?: ElementDefinition[];
  label?: string;
}

export interface CustomTableRecord {
  dataType: string;
  columns: string[];
  storageKey: string;
  feedbackNodeId: string;
  tableNodeId: string;
  previewNodeId: string;
  completeNodeId: string;
  errorNodeId?: string;
  footerNodeId: string;
  toggleNodeId: string;
  toggleErrorsId?: string;
  toggleDuplicatesId?: string;
  toSaveNode: HTMLElement | null;
  toSaveFeedbackNode: HTMLElement | null;
  toSaveTableWrapperNode: HTMLElement | null;
  toSaveButtonNode: HTMLElement | null;
  toSaveAbandonButtonNode: HTMLElement | null;
  savedNode: HTMLElement | null;
  savedTableWrapperNode: HTMLElement | null;
  savedAbandonButtonNode: HTMLElement | null;
}

export interface TooltipDefinition {
  element?: boolean;
  css?: string[];
  id?: string;
  type?: "info" | "error" | "warning" | "question" | "success";
  tooltip: string;
  shape?: "square" | "round";
  look?: "hollow" | "filled";
}

export interface IconDefinition extends ElementDefinition {
  name: 'settings' | 'reset';
}