import * as csvToJson from 'convert-csv-to-json';
import * as path from 'path';
import { fileURLToPath } from 'url';

const outputFileNameMap = {
  'pfL.csv': 'pfL.json',
  'pfR.csv': 'pfR.json',
  'batters.csv': 'batters.json',
  'pitchers.csv': 'pitchers.json',
  'limits.csv': 'limits.json'
}

const inputPath = '../csv';
const outputPath = '../src/data';

const testInputFileName = '../scripts/inputTest.csv'; 
const testOutputFileName = '../scripts/outputTest.json';

const isTest = process.argv.find(str => str.includes('--test'));
const inputFile = process.argv.find(str => str.includes('--inputFile'));

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!isTest && !inputFile) {
  console.warn('Warning: No valid argument provided.');
} else {
  let absoluteIn, absoluteOut;

  if (isTest) {
    absoluteIn = path.join(__dirname,testInputFileName);
    absoluteOut = path.join(__dirname,testOutputFileName);  
  } else {
    const inputFileName = inputFile.split('=')[1];
    const outputFileName = outputFileNameMap[inputFileName];
    if (!inputFileName || !outputFileName) {
      console.warn('Warning: Invalid input file name');
    } else {
      absoluteIn = path.join(__dirname,`${inputPath}/${inputFileName}`);
      absoluteOut = path.join(__dirname,`${outputPath}/${outputFileName}`);
    }
  }

  csvToJson.fieldDelimiter(',').trimHeaderFieldWhiteSpace(true).generateJsonFileFromCsv(absoluteIn,absoluteOut);
}
