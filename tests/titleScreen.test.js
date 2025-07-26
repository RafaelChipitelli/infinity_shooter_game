jest.mock('phaser', () => ({
  __esModule: true,
  default: { Scene: class Scene {} }
}));

jest.mock('../src/firebase.js', () => ({
  __esModule: true,
  db: { collection: jest.fn(() => ({ doc: jest.fn(() => ({ set: jest.fn() })) })) },
  firebase: {},
  auth: { onAuthStateChanged: jest.fn(), currentUser: null },
  googleProvider: {}
}));

import TitleScreen from '../src/scenes/TitleScreen.js';
import Phaser from 'phaser';

test('TitleScreen extends Phaser.Scene', () => {
  const scene = new TitleScreen();
  expect(scene instanceof Phaser.Scene).toBe(true);
});
