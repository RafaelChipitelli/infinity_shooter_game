jest.mock('phaser', () => ({
  __esModule: true,
  default: { Scene: class Scene {} }
}));

jest.mock('../src/firebase.js', () => {
  const getMock = jest.fn();
  const db = {
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: getMock
        }))
      }))
    }))
  };
  return { __esModule: true, db, firebase: {}, auth: {}, getMock };
});

import { getMock } from '../src/firebase.js';

import TitleScreen from '../src/scenes/TitleScreen.js';

test('generateDefaultNickname returns unique value after max attempts', async () => {
  const scene = new TitleScreen();
  getMock.mockResolvedValue({ empty: false });

  const nickname = await scene.generateDefaultNickname();

  expect(getMock).toHaveBeenCalledTimes(5);
  expect(nickname.startsWith('bob-')).toBe(true);
});
