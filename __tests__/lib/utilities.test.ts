import {
  clamp,
  createColorRange,
  getBrightness,
} from '../../src/lib/utilities.ts';
import { limits } from '../../__mocks__/limits.ts';
import * as b from '../../__mocks__/limitsData.ts';

describe('#clamp(num, min, max)', () => {
  it('Number below minimum clamped to minimum', () => {
    expect(clamp(-20, -10, 10)).toBe(-10);
  });
  it('Number above maximum clamped to maximum', () => {
    expect(clamp(20, -10, 10)).toBe(10);
  });
  it('Number wihin bounds unchanged', () => {
    expect(clamp(0, -10, 10)).toBe(0);
  });
});

describe('#createColorRange(limit)', () => {
  it('Creates the expected gradient for batters', () => {
    const colorRange = createColorRange(limits.BOBA);
    expect(colorRange).toEqual(b.boba);
  });
  it('Creates the expected gradient for pitchers', () => {
    const colorRange = createColorRange(limits.POBA);
    expect(colorRange).toEqual(b.poba);
  });
  it('Creates the expected gradient for parks', () => {
    const colorRange = createColorRange(limits.PF);
    expect(colorRange).toEqual(b.pf);
  });
});

describe('#getBrightness(r, g, b)', () => {
  it('Finds 1 for rgb(255, 255, 255)', () => {
    expect(getBrightness(255, 255, 255)).toEqual(1);
  });
  it('Finds 0 for rgb(0, 0, 0)', () => {
    expect(getBrightness(0, 0, 0)).toEqual(0);
  });
  it ('Finds for rgb(54, 97, 172) default MIN', () => {
    expect(getBrightness(54, 97, 172)).toEqual(.39);
  });
  it ('Finds for rgb(216, 34, 41) default MAX', () => {
    expect(getBrightness(216, 34, 41)).toEqual(.44);
  });
  it ('Finds for rgb(227, 97, 102) near max', () => {
    expect(getBrightness(227, 97, 102)).toEqual(.55);
  });
});