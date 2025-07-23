jest.mock('phaser', () => ({
  __esModule: true,
  default: { Scene: class Scene {} }
}));

jest.mock('../src/firebase.js', () => {
  const fakeDocs = [
    { data: () => ({ nickname: 'Alice', time: 42 }) },
    { data: () => ({ nickname: 'Bob', time: 30 }) }
  ];
  const db = {
    collection: jest.fn(function () { return this; }),
    orderBy: jest.fn(function () { return this; }),
    limit: jest.fn(function () { return this; }),
    get: jest.fn(() => Promise.resolve({
      forEach: (cb) => fakeDocs.forEach((doc, idx) => cb(doc, idx))
    }))
  };
  return { __esModule: true, db, firebase: {} };
});

import TitleScreen from '../src/scenes/TitleScreen.js';

test('displays ranking from firebase', async () => {
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

  // Look for calls containing the fake nickname and time
  const calls = scene.add.text.mock.calls.map(c => c[2]);
  expect(calls).toContain('1. Alice - 42s');
  expect(calls).toContain('2. Bob - 30s');
});
