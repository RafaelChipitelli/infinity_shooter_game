jest.mock('phaser', () => ({
  __esModule: true,
  default: { Scene: class Scene {} }
}));

jest.mock('../src/firebase.js', () => {
  const db = {
    collection: jest.fn(function () { return this; }),
    orderBy: jest.fn(function () { return this; }),
    limit: jest.fn(function () { return this; }),
    get: jest.fn(() => Promise.resolve({ forEach: jest.fn() }))
  };
  return {
    __esModule: true,
    db,
    firebase: {}
  };
});

import TitleScreen from '../src/scenes/TitleScreen.js';

test('nickname input focuses on click', async () => {
  const scene = new TitleScreen();
  scene.cameras = { main: { centerX: 0, centerY: 0 } };

  const input = document.createElement('input');
  const addEventListenerSpy = jest.spyOn(input, 'addEventListener');
  const focusSpy = jest.spyOn(input, 'focus').mockImplementation(() => {});

  scene.add = {
    text: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis(), setInteractive: jest.fn().mockReturnThis(), on: jest.fn().mockReturnThis() })),
    dom: jest.fn(() => ({ node: input, setOrigin: jest.fn().mockReturnThis() }))
  };
  scene.input = { keyboard: { on: jest.fn() } };
  scene.scene = { start: jest.fn() };

  await scene.create();

  expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
  const handler = addEventListenerSpy.mock.calls.find(call => call[0] === 'click')[1];
  const stop = jest.fn();
  handler({ stopPropagation: stop });
  expect(stop).toHaveBeenCalled();
  expect(focusSpy).toHaveBeenCalled();
});
