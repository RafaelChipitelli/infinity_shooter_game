import Phaser from "phaser";
import { HUD_TEXTS } from "./HUDConstants";
import { db, auth, googleProvider, firebase } from "../firebase";

export async function upsertUser(user, nickname) {
    return db
        .collection('users')
        .doc(user.uid)
        .set({
            uid: user.uid,
            email: user.email,
            nickname,
            gold: firebase.firestore.FieldValue.increment(0)
        }, { merge: true });
}

export default class TitleScreen extends Phaser.Scene {
    preload() {}

    async generateDefaultNickname() {
        const base = 'bob';
        const maxAttempts = 5;

        for (let idx = 0; idx < maxAttempts; idx++) {
            const candidate = idx === 0 ? base : `${base}${idx}`;
            const snap = await db
                .collection('scores')
                .where('nickname', '==', candidate)
                .limit(1)
                .get();
            if (snap.empty) {
                return candidate;
            }
        }

        return `${base}-${Date.now()}`;
    }

    async create() {

        // Crie um botão centralizado
        const { centerX, centerY } = this.cameras.main;


        let domElement = document.getElementById('nickname');
        let loginButton = document.getElementById('google-login');
        let userInfo = document.getElementById('user-info');
        let userGoldEl = document.getElementById('user-gold');
        let nicknameInput;

        if (!loginButton) {
            loginButton = document.createElement('button');
        }
        if (!userInfo) {
            userInfo = document.createElement('div');
        }
        if (!userGoldEl) {
            userGoldEl = document.createElement('div');
        }

        if (domElement) {
            nicknameInput = { node: domElement };
            domElement.style.display = 'block';
            domElement.value = localStorage.getItem('nickname') || '';
        } else {
            // Campo para digitar nickname criado via Phaser DOM
            nicknameInput = this.add.dom(centerX, centerY - 40, 'input')
                .setOrigin(0.5);
            nicknameInput.node.setAttribute('type', 'text');
            nicknameInput.node.setAttribute('placeholder', 'Nickname');
            nicknameInput.node.style.display = 'block';
            nicknameInput.node.value = localStorage.getItem('nickname') || '';
        }

        nicknameInput.node.addEventListener('click', (e) => {
            e.stopPropagation();
            nicknameInput.node.focus();
        });

        // Estiliza para alto contraste e tamanho maior
        Object.assign(nicknameInput.node.style, {
            background: '#ffffff',
            color: '#000000',
            padding: '8px 12px',
            fontSize: '18px',
            border: '2px solid #000000',
            borderRadius: '4px',
            width: '220px',
            textAlign: 'center',
            cursor: 'text',
            pointerEvents: 'auto',
            zIndex: 1000
        });

        nicknameInput.node.addEventListener('focus', () => {
            this.input.keyboard.enabled = false;
        });
        nicknameInput.node.addEventListener('blur', () => {
            this.input.keyboard.enabled = true;
        });

        loginButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                if (auth.currentUser) {
                    await auth.signOut();
                } else {
                    await auth.signInWithPopup(googleProvider);
                }
            } catch (err) {
                console.error('Auth error', err);
            }
        });

        auth.onAuthStateChanged(async (user) => {
            if (user) {
                const nickname = user.displayName || nicknameInput.node.value || user.email;
                nicknameInput.node.value = nickname;
                nicknameInput.node.style.display = 'none';
                loginButton.textContent = 'Logout';
                userInfo.innerHTML = `<img src="${user.photoURL}" style="width:32px;height:32px;border-radius:50%;"> <span>${nickname}</span>`;
                localStorage.setItem('nickname', nickname);
                try {
                    await upsertUser(user, nickname);
                    const snap = await db.collection('users').doc(user.uid).get();
                    const gold = snap.exists && snap.data().gold ? snap.data().gold : 0;
                    if (userGoldEl) {
                        userGoldEl.textContent = `Gold: ${gold}`;
                    }
                } catch (err) {
                    console.error('Failed to save user', err);
                }
            } else {
                loginButton.textContent = 'Login with Google';
                userInfo.innerHTML = '';
                if (userGoldEl) userGoldEl.textContent = '';
                nicknameInput.node.style.display = 'block';
                nicknameInput.node.value = localStorage.getItem('nickname') || '';
            }
        });
        // 🔥 Mostrar Top 10 do Firebase
        let startY = 50;

        try {
            const snapshot = await db
                .collection("scores")
                .orderBy("time", "desc")
                .limit(10)
                .get();

            this.add.text(centerX, startY - 30, "🏆 Ranking:", {
                fontSize: "20px",
                color: "#ffffff"
            }).setOrigin(0.5);

            if (snapshot.empty) {
                this.add.text(centerX, startY, 'No scores yet', {
                    fontSize: '16px',
                    color: '#dddddd'
                }).setOrigin(0.5);
            } else {
                let idx = 0;
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    this.add.text(centerX, startY + idx * 25, `${idx + 1}. ${data.nickname} - ${data.time}s`, {
                        fontSize: "16px",
                        color: "#dddddd"
                    }).setOrigin(0.5);
                    idx += 1;
                });
            }
        } catch (err) {
            console.error('Failed to load ranking', err);
        }
        const button = this.add.text(centerX, centerY, 'START', {
            fill: '#0f0',
            fontSize: '20px'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => button.setTint(0xcccccc))
            .on('pointerout', () => button.clearTint())
            .on('pointerdown', async () => {
                let value = nicknameInput.node.value.trim();
                if (!value) {
                    value = await this.generateDefaultNickname();
                    nicknameInput.node.value = value;
                }
                localStorage.setItem('nickname', value);
                // Hide the nickname input when starting the game
                nicknameInput.node.style.display = 'none';

                // Reinicia valores importantes do HUD ao iniciar o jogo
                HUD_TEXTS.life = 100;
                HUD_TEXTS.dps = 1;

                // Inicia a cena principal do jogo
                this.scene.start('game');
            });

        // Permitir que a tecla ENTER também inicie o jogo
        this.input.keyboard.on('keydown-ENTER', () => button.emit('pointerdown'));
    }
}
