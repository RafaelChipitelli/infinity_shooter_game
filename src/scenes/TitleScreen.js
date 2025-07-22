import Phaser from "phaser";
import { HUD_TEXTS } from "./HUDConstants";
import { db } from "../firebase";

export default class TitleScreen extends Phaser.Scene {
    preload() {}

    create() {

        // Crie um botão centralizado
        const { centerX, centerY } = this.cameras.main;
        // Campo para digitar nickname
        const nicknameInput = this.add.dom(centerX, centerY - 40, 'input')
            .setOrigin(0.5);
        nicknameInput.node.setAttribute('type', 'text');
        nicknameInput.node.setAttribute('placeholder', 'Nickname');
        nicknameInput.node.value = localStorage.getItem('nickname') || '';
        // 🔥 Mostrar Top 10 do Firebase
        let startY = 50;

        db.collection("scores")
        .orderBy("time", "desc")
        .limit(10)
        .get()
        .then(snapshot => {
            this.add.text(centerX, startY - 30, "🏆 Ranking:", {
            fontSize: "20px",
            color: "#ffffff"
            }).setOrigin(0.5);

            snapshot.forEach((doc, index) => {
            const data = doc.data();
            this.add.text(centerX, startY + index * 25, `${index + 1}. ${data.nickname} - ${data.time}s`, {
                fontSize: "16px",
                color: "#dddddd"
            }).setOrigin(0.5);
            });
        })
        .catch(err => console.error('Failed to load ranking', err));
        const button = this.add.text(centerX, centerY, 'START', {
            fill: '#0f0',
            fontSize: '20px',
            cursor: 'pointer'
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerover', () => button.setTint(0xcccccc))
            .on('pointerout', () => button.clearTint())
            .on('pointerdown', () => {
                const value = nicknameInput.node.value.trim();
                if (!value) {
                    nicknameInput.node.focus();
                    return;
                }
                localStorage.setItem('nickname', value);

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
