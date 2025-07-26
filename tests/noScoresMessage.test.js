jest.mock('phaser', () => ({
  __esModule: true,
  default: { Scene: class Scene {} }
}));

jest.mock('../src/firebase.js', () => {
  const db = {
    collection: jest.fn(function () { return this; }),
    orderBy: jest.fn(function () { return this; }),
    limit: jest.fn(function () { return this; }),
    get: jest.fn(() => Promise.resolve({ empty: true, forEach: jest.fn() }))
  };
  return { __esModule: true, db, firebase: {}, auth: {} };
});

import TitleScreen from '../src/scenes/TitleScreen.js';

test('shows message when no scores', async () => {
  const scene = new TitleScreen();
  scene.cameras = { main: { centerX: 0, centerY: 0 } };
  const input = document.createElement('input');
  scene.add = {
    text: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis(), setInteractive: jest.fn().mockReturnThis(), on: jest.fn().mockReturnThis() })),
    dom: jest.fn(() => ({ node: input, setOrigin: jest.fn().mockReturnThis() }))
  };
  scene.input = { keyboard: { on: jest.fn(), enabled: true } };
  scene.scene = { start: jest.fn() };

  await scene.create();

  const texts = scene.add.text.mock.calls.map(c => c[2]);
  expect(texts).toContain('No scores yet');
});
