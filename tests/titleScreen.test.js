jest.mock('phaser', () => ({
  __esModule: true,
  default: { Scene: class Scene {} }
}));

jest.mock('../src/firebase.js', () => ({
  __esModule: true,
  db: {},
  firebase: {},
  auth: {}
}));

import TitleScreen from '../src/scenes/TitleScreen.js';
import Phaser from 'phaser';

test('TitleScreen extends Phaser.Scene', () => {
  const scene = new TitleScreen();
  expect(scene instanceof Phaser.Scene).toBe(true);
});
