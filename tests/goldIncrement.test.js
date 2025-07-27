jest.mock('phaser', () => ({
  __esModule: true,
  default: {
    Scene: class Scene {},
    Math: {
      Angle: { Between: jest.fn(() => 0) },
      Distance: {
        Squared: jest.fn(() => 0)
      }
    }
  }
}));

import { updateProjectiles } from '../src/scenes/helpers/projectiles.js';
import { HUD_TEXTS } from '../src/scenes/HUDConstants.js';
import Phaser from 'phaser';

global.Phaser = Phaser;

test('increments gold every 10 kills', () => {
  const goldText = { setText: jest.fn() };
  const target = { shootEvent: {}, destroy: jest.fn(), active: true, x: 0, y: 0 };
  const projectile = {
    active: true,
    target,
    x: 0,
    y: 0,
    body: { setVelocity: jest.fn() },
    destroy: jest.fn()
  };
  const scene = {
    projectiles: { children: { each: (fn, ctx) => fn.call(ctx, projectile) } },
    enemies: { remove: jest.fn(), getChildren: jest.fn(() => []) },
    shooters: { remove: jest.fn(), getChildren: jest.fn(() => []) },
    enemiesKilledSess: 9,
    hudTexts: { gold: goldText },
    projectileSpeed: 100,
    time: { removeEvent: jest.fn() },
    game: { config: { width: 800, height: 600 } }
  };
  HUD_TEXTS.gold = 0;
  updateProjectiles(scene);
  expect(scene.enemiesKilledSess).toBe(10);
  expect(HUD_TEXTS.gold).toBe(1);
  expect(goldText.setText).toHaveBeenCalledWith('Gold: 1');
});
