import Phaser from "phaser";
import { auth, db } from "../firebase";

export default class RegisterScreen extends Phaser.Scene {
    create() {
        const { centerX, centerY } = this.cameras.main;

        const nicknameInput = this.add.dom(centerX, centerY - 40, 'input').setOrigin(0.5);
        nicknameInput.node.setAttribute('type', 'text');
        nicknameInput.node.setAttribute('placeholder', 'Nickname');

        const passwordInput = this.add.dom(centerX, centerY, 'input').setOrigin(0.5);
        passwordInput.node.setAttribute('type', 'password');
        passwordInput.node.setAttribute('placeholder', 'Senha');

        this.styleInput(nicknameInput.node);
        this.styleInput(passwordInput.node);

        const message = this.add.text(centerX, centerY + 80, '', { fontSize: '16px', color: '#f00' }).setOrigin(0.5);

        this.add.text(centerX, centerY + 40, 'Registrar', { fill: '#0f0', fontSize: '20px' })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', async () => {
                const nickname = nicknameInput.node.value.trim();
                const password = passwordInput.node.value.trim();
                if (!nickname || !password) return;
                const email = `${nickname}@bulletrush.fun`;
                try {
                    const cred = await auth.createUserWithEmailAndPassword(email, password);
                    await db.collection('users').doc(cred.user.uid).set({
                        nickname,
                        skin: 0,
                        money: 0
                    });
                    localStorage.setItem('uid', cred.user.uid);
                    localStorage.setItem('nickname', nickname);
                    this.scene.start('titlescreen');
                } catch (err) {
                    message.setText(err.message);
                }
            });
    }

    styleInput(node) {
        Object.assign(node.style, {
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

        node.addEventListener('focus', () => { this.input.keyboard.enabled = false; });
        node.addEventListener('blur', () => { this.input.keyboard.enabled = true; });
    }
}
