import TitleScreen from '../src/scenes/TitleScreen.js';

jest.mock('phaser', () => ({
  __esModule: true,
  default: { Scene: class Scene {} }
}));

jest.mock('../src/firebase.js', () => {
  const db = {
    collection: jest.fn(() => ({
      orderBy: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn(() => Promise.resolve({ forEach: jest.fn() }))
        }))
      }))
    }))
  };
  return { __esModule: true, db, firebase: {} };
});

test('uses external nickname input if available', async () => {
  const external = document.createElement('input');
  external.id = 'nickname';
  document.body.appendChild(external);

  const scene = new TitleScreen();
  scene.cameras = { main: { centerX: 0, centerY: 0 } };
  const pass = document.createElement('input');
  scene.add = {
    text: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis(), setInteractive: jest.fn().mockReturnThis(), on: jest.fn().mockReturnThis() })),
    dom: jest.fn()
  };
  scene.add.dom.mockReturnValueOnce({ node: pass, setOrigin: jest.fn().mockReturnThis() });
  scene.input = { keyboard: { on: jest.fn(), enabled: true } };
  scene.scene = { start: jest.fn() };

  await scene.create();

  expect(scene.add.dom).toHaveBeenCalledTimes(1);
  expect(external.style.pointerEvents).toBe('auto');
  document.body.removeChild(external);
});
