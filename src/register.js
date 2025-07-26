import { db } from './firebase';

const nickInput = document.getElementById('reg-nickname');
const passInput = document.getElementById('reg-password');
const submitBtn = document.getElementById('reg-submit');

export function navigate(url) {
  if (typeof jest !== 'undefined') return;
  try {
    window.location.assign(url);
  } catch (err) {
    // ignore navigation errors in non-browser environments
  }
}

export async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function handleRegister() {
  const nickname = nickInput.value.trim();
  const password = passInput.value;

  if (!nickname || !password) {
    alert('Preencha nickname e senha');
    return;
  }

  try {
    // check if nickname already exists
    const existingSnap = await db
      .collection('users')
      .where('nickname', '==', nickname)
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      alert('Usuário já cadastrado');
      return;
    }

    const hashed = await hashPassword(password);
    await db.collection('users').add({ nickname, password: hashed });
    alert('Registrado com sucesso!');
    navigate('index.html');
  } catch (err) {
    console.error('Falha ao registrar', err);
    alert('Erro ao registrar');
  }

}

submitBtn.addEventListener('click', handleRegister);
