import Phaser from "phaser";
import { HUD_TEXTS } from "./HUDConstants";

export default class TitleScreen extends Phaser.Scene {
    preload() {}

    create() {
        // Crie os textos do HUD
        const scoreText = this.add.text(10, 10, `Score: ${HUD_TEXTS.score}`, { fontSize: '16px', fill: '#ffffff' });
        const roundText = this.add.text(10, 30, `Round: ${HUD_TEXTS.round}`, { fontSize: '16px', fill: '#ffffff' });
        const enemiesAliveText = this.add.text(10, 50, `Enemies Alive: ${HUD_TEXTS.enemiesAlive}`, { fontSize: '16px', fill: '#ffffff' });
        const lifeText = this.add.text(10, 70, `Life: ${HUD_TEXTS.life}`, { fontSize: '16px', fill: '#ffffff' });
        const dpsText = this.add.text(10, 90, `DPS: ${HUD_TEXTS.dps}`, { fontSize: '16px', fill: '#ffffff' });

        // Crie um botão
        const button = this.add.text(200, 200, 'Incrementar', { fill: '#0f0', fontSize: '20px', cursor: 'pointer' }) // Define o cursor como "pointer"
            .setInteractive()
            .on('pointerover', () => button.setTint(0xcccccc)) // Muda a cor ao passar o cursor sobre o botão
            .on('pointerout', () => button.clearTint()) // Remove a cor ao retirar o cursor do botão
            .on('pointerdown', () => {
                // Incrementa todas as constantes em 1
                HUD_TEXTS.score += 1;
                HUD_TEXTS.round += 1;
                HUD_TEXTS.enemiesAlive += 1;
                HUD_TEXTS.life += 1;
                HUD_TEXTS.dps += 1;

                // Atualiza os textos do HUD
                scoreText.setText(`Score: ${HUD_TEXTS.score}`);
                roundText.setText(`Round: ${HUD_TEXTS.round}`);
                enemiesAliveText.setText(`Enemies Alive: ${HUD_TEXTS.enemiesAlive}`);
                lifeText.setText(`Life: ${HUD_TEXTS.life}`);
                dpsText.setText(`DPS: ${HUD_TEXTS.dps}`);
            });
    }
}
