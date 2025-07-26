jest.mock('../src/firebase.js', () => {
  const add = jest.fn(() => Promise.resolve());
  const get = jest.fn(() => Promise.resolve({ empty: true }));
  const db = {
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        limit: jest.fn(() => ({ get }))
      })),
      add
    }))
  };
  return { __esModule: true, db, firebase: {}, add, get };
});

import { TextEncoder } from 'util';

let handler, nickInput, passInput, registerModule, add, get;

beforeEach(async () => {
  global.TextEncoder = TextEncoder;
  if (!global.crypto) global.crypto = {};
  global.crypto.subtle = { digest: jest.fn(() => Promise.resolve(new ArrayBuffer(1))) };
  window.crypto = global.crypto;
  document.body.innerHTML = `
    <input id="reg-nickname" />
    <input id="reg-password" />
    <button id="reg-submit"></button>
  `;
  nickInput = document.getElementById('reg-nickname');
  passInput = document.getElementById('reg-password');
  registerModule = await import('../src/register.js');
  ({ add, get } = await import('../src/firebase.js'));
  handler = registerModule.handleRegister;
  jest.spyOn(registerModule, 'navigate').mockImplementation(() => {});
});

afterEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

test('successful registration stores user and redirects', async () => {
  nickInput.value = 'bob';
  passInput.value = 'secret';
  global.alert = jest.fn();

  await handler();

  expect(get).toHaveBeenCalled();
  expect(add).toHaveBeenCalled();
  expect(global.alert).toHaveBeenCalledWith('Registrado com sucesso!');
});

test('shows error when nickname exists', async () => {
  // make get return non-empty
  get.mockResolvedValueOnce({ empty: false });
  nickInput.value = 'bob';
  passInput.value = 'secret';
  global.alert = jest.fn();

  await handler();

  expect(add).not.toHaveBeenCalled();
  expect(global.alert).toHaveBeenCalledWith('Usuário já cadastrado');
});

