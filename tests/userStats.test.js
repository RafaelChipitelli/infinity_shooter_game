jest.mock('phaser', () => ({
  __esModule: true,
  default: { Scene: class Scene {} }
}));

jest.mock('../src/firebase.js', () => {
  const setMock = jest.fn();
  const addMock = jest.fn();
  const users = { doc: jest.fn(() => ({ set: setMock })) };
  const scores = { add: addMock };
  const db = {
    collection: jest.fn(name => (name === 'users' ? users : scores))
  };
  const incrementMock = jest.fn(v => ({ inc: v }));
  const firebase = { firestore: { FieldValue: { increment: incrementMock, serverTimestamp: jest.fn() } } };
  const auth = { currentUser: { uid: '1' } };
  return { __esModule: true, db, firebase, auth, googleProvider: {}, setMock, incrementMock, addMock };
});

import { setMock, incrementMock } from '../src/firebase.js';
import Game from '../src/scenes/Game.js';

test('updates user stats on player death', async () => {
  const game = new Game();
  game.player = { health: 0 };
  game.sessionStart = Date.now() - 2000;
  game.enemiesKilledSess = 2;
  game.resetGameParams = jest.fn();
  game.scene = { start: jest.fn() };

  await game.handlePlayerEnemyCollision(game.player, {});

  expect(setMock).toHaveBeenCalledWith(
    {
      totalTimeAlive: { inc: expect.any(Number) },
      totalEnemiesKilled: { inc: 2 }
    },
    { merge: true }
  );
  expect(incrementMock).toHaveBeenCalledWith(2);
});
