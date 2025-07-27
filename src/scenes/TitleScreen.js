import Phaser from "phaser";
import { HUD_TEXTS } from "./HUDConstants";
import { db, auth, googleProvider, firebase, FieldValue } from "../firebase";

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

const BOTTT_SKIN_COST = 5;

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

        this.playerGold = 0;
        this.skinImg = null;

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
                    const data = snap.exists ? snap.data() : {};
                    const gold = data.gold || 0;
                    this.playerGold = gold;
                    user.botttsSkinUrl = data.botttsSkinUrl;
                    this.registry.set('currentUser', user);
                    if (userGoldEl) {
                        userGoldEl.textContent = `Gold: ${gold}`;
                    }
                    const skinEl = document.getElementById('user-skin');
                    if (data.botttsSkinUrl) {
                        this.showPurchasedSkin(data.botttsSkinUrl);
                    } else if (skinEl) {
                        skinEl.style.display = 'none';
                    }
                } catch (err) {
                    console.error('Failed to save user', err);
                }
            } else {
                loginButton.textContent = 'Login with Google';
                userInfo.innerHTML = '';
                if (userGoldEl) userGoldEl.textContent = '';
                const userSkin = document.getElementById('user-skin');
                if (userSkin) userSkin.style.display = 'none';
                nicknameInput.node.style.display = 'block';
                nicknameInput.node.value = localStorage.getItem('nickname') || '';
                this.registry.set('currentUser', null);
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

        const buySkinBtn = this.add.text(centerX, centerY + 100, 'Buy Bottts Skin (5 gold)', {
            fontSize:'18px',
            fill:'#ff0',
            backgroundColor:'#111',
            padding:{x:8,y:4}
        })
          .setOrigin(0.5)
          .setInteractive({ useHandCursor:true })
          .on('pointerup', () => this.handleBuySkin());

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

    async handleBuySkin() {
        try {
            const user = this.registry.get('currentUser');
            if (!user) return alert('Faça login primeiro!');
            const userRef = db.collection('users').doc(user.uid);
            const snap = await userRef.get();
            const data = snap.data() || {};
            if ((data.gold || 0) < BOTTT_SKIN_COST) {
                return alert('Gold insuficiente!');
            }
            const seed = Math.random().toString(36).substring(2,10);
            const skinUrl = `https://api.dicebear.com/9.x/bottts/svg?seed=${seed}&size=128`;
            await userRef.update({
                gold: FieldValue.increment(-BOTTT_SKIN_COST),
                botttsSkinUrl: skinUrl
            });
            const regUser = this.registry.get('currentUser');
            if (regUser) {
                regUser.botttsSkinUrl = skinUrl;
                this.registry.set('currentUser', regUser);
            }
            this.playerGold = (data.gold || 0) - BOTTT_SKIN_COST;
            const userGoldEl = document.getElementById('user-gold');
            if (userGoldEl) userGoldEl.textContent = `Gold: ${this.playerGold}`;
            this.showPurchasedSkin(skinUrl);
        } catch (err) {
            console.error('Buy skin failed', err);
        }
    }

    showPurchasedSkin(url) {
        let el = document.getElementById('user-skin');
        if (!el) {
            el = document.createElement('img');
            el.id = 'user-skin';
            Object.assign(el.style, {
                position: 'absolute',
                top: '72px',
                right: '140px',
                width: '64px',
                height: '64px',
                zIndex: 1000,
                display: 'none'
            });
            document.body.appendChild(el);
        }
        el.src = url;
        el.style.display = 'block';
    }
}
