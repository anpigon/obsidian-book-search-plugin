import * as utils from './utils';

jest.mock('@settings/settings', () => jest.fn());

describe('util.js', () => {
  it('replaceIllegalFileNameCharactersInString', () => {
    expect(utils.replaceIllegalFileNameCharactersInString('재레드 다이아몬드의 <대변동 : 위기, 선택, 변화>')).toBe('재레드 다이아몬드의 대변동 위기 선택 변화');
  });
});
