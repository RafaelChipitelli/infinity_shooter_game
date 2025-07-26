import { db } from './firebase';

const nickInput = document.getElementById('reg-nickname');
const passInput = document.getElementById('reg-password');
const submitBtn = document.getElementById('reg-submit');

async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

submitBtn.addEventListener('click', async () => {
  const nickname = nickInput.value.trim();
  const password = passInput.value;

  if (!nickname || !password) {
    alert('Preencha nickname e senha');
    return;
  }

  try {
    const hashed = await hashPassword(password);
    await db.collection('users').add({ nickname, password: hashed });
    alert('Registrado com sucesso!');
    window.location.href = 'index.html';
  } catch (err) {
    console.error('Falha ao registrar', err);
    alert('Erro ao registrar');
  }
});
