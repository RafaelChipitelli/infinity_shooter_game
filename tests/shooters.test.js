jest.mock('phaser', () => ({
  __esModule: true,
  default: {
    Scene: class Scene {},
    Math: {
      Between: jest.fn(() => 0),
      Angle: { Between: jest.fn(() => 0) },
      Distance: { Squared: jest.fn(() => 0) }
    }
  }
}));

jest.mock('../src/firebase.js', () => ({
  __esModule: true,
  db: {},
  firebase: {},
  auth: {}
}));

import { createShooterEnemies as realCreateShooterEnemies } from '../src/scenes/helpers/enemies.js';
import { updateProjectiles } from '../src/scenes/helpers/projectiles.js';
import Phaser from 'phaser';
global.Phaser = Phaser;


test('createShooterEnemies spawns shooters and timers', () => {
  const created = [];
  const addCircle = jest.fn(() => {
    const obj = {};
    created.push(obj);
    return obj;
  });
  const scene = {
    add: { circle: addCircle },
    physics: { add: { existing: jest.fn(obj => { obj.body = { setVelocity: jest.fn() }; }) } },
    shooters: { add: jest.fn(), getChildren: jest.fn(() => []) },
    time: { addEvent: jest.fn(() => ({})) },
    game: { config: { width: 800, height: 600 } },
    player: { x: 0, y: 0 }
  };
  realCreateShooterEnemies(scene, 2);
  expect(scene.shooters.add).toHaveBeenCalledTimes(2);
  expect(scene.time.addEvent).toHaveBeenCalledTimes(2);
  expect(scene.time.addEvent.mock.calls[0][0].delay).toBe(1500);
  created.forEach(shooter => {
    expect(shooter.shootEvent).toBeDefined();
  });
});

test('destroying shooter removes its timer', () => {
  const shooter = { x: 0, y: 0, active: true, destroy: jest.fn(), shootEvent: {} };
  const projectile = {
    active: true,
    target: shooter,
    x: 0,
    y: 0,
    body: { setVelocity: jest.fn() },
    destroy: jest.fn()
  };
  const scene = {
    time: { removeEvent: jest.fn() },
    enemies: { remove: jest.fn(), getChildren: jest.fn(() => []) },
    shooters: { remove: jest.fn(), getChildren: jest.fn(() => []) },
    projectiles: { children: { each: (fn, ctx) => fn.call(ctx, projectile) } },
    projectileSpeed: 100,
    game: { config: { width: 800, height: 600 } }
  };
  updateProjectiles(scene);
  expect(scene.time.removeEvent).toHaveBeenCalledWith(shooter.shootEvent);
  expect(shooter.destroy).toHaveBeenCalled();
  expect(projectile.destroy).toHaveBeenCalled();
  expect(scene.shooters.remove).toHaveBeenCalledWith(shooter, true, true);
});


test('spawnWave spawns shooters equal to current round', async () => {
  jest.resetModules();
  jest.doMock('../src/scenes/helpers/enemies.js', () => ({
    __esModule: true,
    createEnemies: jest.fn(),
    updateEnemies: jest.fn(),
    separateEnemies: jest.fn(),
    createShooterEnemies: jest.fn(),
    updateShooterEnemies: jest.fn()
  }));

  const { default: Game } = await import('../src/scenes/Game.js');
  const enemies = await import('../src/scenes/helpers/enemies.js');
  const { createEnemies, createShooterEnemies } = enemies;

  const game = new Game();
  game.enemies = {};
  game.shooters = {};
  game.currentRound = 3;
  game.enemiesTotal = 0;

  game.spawnWave();
  expect(createEnemies).toHaveBeenCalledWith(game, 15);
  expect(createShooterEnemies).toHaveBeenCalledWith(game, 3);
  expect(game.enemiesTotal).toBe(18);
});
