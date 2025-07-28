jest.mock('phaser', () => ({
  __esModule: true,
  default: { Scene: class Scene {} }
}));

jest.mock('../src/firebase.js', () => {
  const setMock = jest.fn();
  const incrementMock = jest.fn(v => ({ inc: v }));
  const usersCollection = { doc: jest.fn(() => ({
    set: setMock,
    get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ gold: 0 }) }))
  })) };
  const scoresCollection = {
    orderBy: jest.fn(() => ({
      limit: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({ forEach: jest.fn() }))
      }))
    }))
  };
  const db = {
    collection: jest.fn(name => {
      if (name === 'users') return usersCollection;
      return scoresCollection;
    })
  };
  const auth = { onAuthStateChanged: jest.fn() };
  const firebase = { firestore: { FieldValue: { increment: incrementMock } } };
  return {
    __esModule: true,
    db,
    firebase,
    auth,
    googleProvider: {},
    setMock,
    incrementMock,
    FieldValue: firebase.firestore.FieldValue
  };
});

import TitleScreen from '../src/scenes/TitleScreen.js';
import Phaser from 'phaser';
import { auth, setMock, incrementMock } from '../src/firebase.js';

test('TitleScreen extends Phaser.Scene', () => {
  const scene = new TitleScreen();
  expect(scene instanceof Phaser.Scene).toBe(true);
});

test('saves user info on login', async () => {
  const scene = new TitleScreen();
  scene.cameras = { main: { centerX: 0, centerY: 0 } };
  scene.scale = { on: jest.fn() };
  const input = document.createElement('input');
  scene.add = {
    text: jest.fn(() => ({ setOrigin: jest.fn().mockReturnThis(), setInteractive: jest.fn().mockReturnThis(), on: jest.fn().mockReturnThis() })),
    dom: jest.fn(() => ({ node: input, setOrigin: jest.fn().mockReturnThis() }))
  };
  scene.input = { keyboard: { on: jest.fn(), enabled: true } };
  scene.scene = { start: jest.fn() };

  await scene.create();

  const cb = auth.onAuthStateChanged.mock.calls[0][0];
  await cb({ uid: '1', email: 'a@a.com', displayName: 'Nick', photoURL: '' });

  expect(setMock).toHaveBeenCalledWith(
    { uid: '1', email: 'a@a.com', nickname: 'Nick', gold: { inc: 0 } },
    { merge: true }
  );
  expect(incrementMock).toHaveBeenCalledWith(0);
});
