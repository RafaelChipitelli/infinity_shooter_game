import Phaser from "phaser";
import { HUD_TEXTS } from "./HUDConstants";

export default class TitleScreen extends Phaser.Scene {
    preload() {}

    create() {

        // Crie um botão centralizado
        const { centerX, centerY } = this.cameras.main;
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
                // Reinicia valores importantes do HUD ao iniciar o jogo
                HUD_TEXTS.life = 100;
                HUD_TEXTS.dps = 1;

                // Inicia a cena principal do jogo
                this.scene.start('game');
            });
    }
}
