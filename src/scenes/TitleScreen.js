import Phaser from "phaser";
import { HUD_TEXTS } from "./HUDConstants";
import { db } from "../firebase";
import bcrypt from "bcryptjs";

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

    async loginOrRegister(nickname, password) {
        const snap = await db
            .collection('users')
            .where('nickname', '==', nickname)
            .limit(1)
            .get();

        if (snap.empty) {
            const passwordHash = await bcrypt.hash(password, 10);
            const doc = await db.collection('users').add({
                nickname,
                passwordHash,
            });
            localStorage.setItem('userId', doc.id);
            return doc.id;
        } else {
            const doc = snap.docs[0];
            const data = doc.data();
            const match = await bcrypt.compare(password, data.passwordHash);
            if (!match) {
                throw new Error('invalid');
            }
            localStorage.setItem('userId', doc.id);
            return doc.id;
        }
    }

    async create() {

        // Crie um botão centralizado
        const { centerX, centerY } = this.cameras.main;


        let domElement = document.getElementById('nickname');
        let nicknameInput;
        let passDom = document.getElementById('password');
        let passwordInput;

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

        if (passDom) {
            passwordInput = { node: passDom };
            passDom.style.display = 'block';
            passDom.value = '';
        } else {
            passwordInput = this.add.dom(centerX, centerY + 10, 'input')
                .setOrigin(0.5);
            passwordInput.node.setAttribute('type', 'password');
            passwordInput.node.setAttribute('placeholder', 'Password');
            passwordInput.node.style.display = 'block';
            passwordInput.node.value = '';
        }

        nicknameInput.node.addEventListener('click', (e) => {
            e.stopPropagation();
            nicknameInput.node.focus();
        });

        passwordInput.node.addEventListener('click', (e) => {
            e.stopPropagation();
            passwordInput.node.focus();
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

        Object.assign(passwordInput.node.style, {
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

        passwordInput.node.addEventListener('focus', () => {
            this.input.keyboard.enabled = false;
        });
        passwordInput.node.addEventListener('blur', () => {
            this.input.keyboard.enabled = true;
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
                const nicknameValue = nicknameInput.node.value.trim();
                const passwordValue = passwordInput.node.value.trim();
                let finalNickname = nicknameValue;
                if (!finalNickname) {
                    finalNickname = await this.generateDefaultNickname();
                    nicknameInput.node.value = finalNickname;
                }
                if (!passwordValue) {
                    return; // require password
                }

                try {
                    await this.loginOrRegister(finalNickname, passwordValue);
                } catch (err) {
                    console.error('Auth failed', err);
                    return;
                }

                localStorage.setItem('nickname', finalNickname);
                nicknameInput.node.style.display = 'none';
                passwordInput.node.style.display = 'none';

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
