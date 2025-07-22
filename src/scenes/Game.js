import Phaser from "phaser";
import {
    createPlayer,
    updatePlayerMovement,
    enforcePlayerBounds
} from "./helpers/player";
import {
    createEnemies,
    updateEnemies,
    separateEnemies
} from "./helpers/enemies";
import { fireProjectile, updateProjectiles } from "./helpers/projectiles";
import { HUD_TEXTS } from "./HUDConstants";
import { db, firebase } from "../firebase";


class Game extends Phaser.Scene {
    constructor() {
        super();
        this.player = null;
        this.enemies = null;
        this.playerSpeed = 150;
        this.enemySpeed = 150;
        this.playerVelocityX = 0;
        this.playerVelocityY = 0;
        this.cursors = null;
        this.wasdKeys = null;
        this.projectiles = null;
        this.projectileSpeed = 300;
        this.projectileDamage = HUD_TEXTS.dps;

        this.playerInitialHealth = HUD_TEXTS.life;
        this.enemyDamage = 10;

        this.touchPointer = null;

        this.hudTexts = {};
        this.enemiesTotal = 0;
        this.startTime = 0;
        this.currentRound = 1;
        this.nextWaveScheduled = false;
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D');

        this.player = createPlayer(this);
        HUD_TEXTS.life = this.player.health;

        // Registra eventos de toque para movimentação
        this.input.on('pointerdown', (pointer) => {
            this.touchPointer = pointer;
        });
        this.input.on('pointerup', () => {
            this.touchPointer = null;
        });
        this.input.on('pointermove', (pointer) => {
            if (this.touchPointer) {
                this.touchPointer = pointer;
            }
        });

        this.projectiles = this.physics.add.group();

        // grupo de inimigos para facilitar a colisão
        this.enemies = this.physics.add.group();

        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);

        // dispara um projétil a cada segundo mirando no inimigo mais próximo
        this.time.addEvent({
            delay: 1000,
            callback: () => fireProjectile(this),
            loop: true
        });

        // Inicializa primeira onda de inimigos
        this.spawnWave();

        // Inicializa HUD
        this.startTime = this.time.now;
        this.hudTexts.enemiesAlive = this.add.text(10, 10, '', { fontSize: '16px', fill: '#ffffff' });
        this.hudTexts.enemiesDefeated = this.add.text(10, 30, '', { fontSize: '16px', fill: '#ffffff' });
        this.hudTexts.gold = this.add.text(10, 50, `Gold: ${HUD_TEXTS.gold}`, { fontSize: '16px', fill: '#ffffff' });
        this.hudTexts.timeAlive = this.add.text(10, 70, '', { fontSize: '16px', fill: '#ffffff' });
        this.hudTexts.life = this.add.text(10, 90, `Life: ${HUD_TEXTS.life}`, { fontSize: '16px', fill: '#ffffff' });
        this.hudTexts.dps = this.add.text(10, 110, `DPS: ${HUD_TEXTS.dps}`, { fontSize: '16px', fill: '#ffffff' });
        this.hudTexts.round = this.add.text(10, 130, `Round: ${this.currentRound}`, { fontSize: '16px', fill: '#ffffff' });

        // prevenir que os inimigos se sobreponham
        this.physics.add.collider(this.enemies, this.enemies);

        // movimentação será controlada diretamente no método update
    }

    update() {
        updatePlayerMovement(this);
        updateEnemies(this);
        separateEnemies(this);
        updateProjectiles(this);
        enforcePlayerBounds(this);

        // Atualiza valores do HUD
        const alive = this.enemies.getChildren().length;
        if (alive === 0 && !this.nextWaveScheduled) {
            this.nextWaveScheduled = true;
            this.time.delayedCall(1000, () => {
                this.currentRound += 1;
                HUD_TEXTS.round = this.currentRound;
                this.spawnWave();
                this.nextWaveScheduled = false;
            });
        }
        const defeated = this.enemiesTotal - alive;
        this.hudTexts.enemiesAlive.setText(`Enemies Alive: ${alive}`);
        this.hudTexts.enemiesDefeated.setText(`Enemies Defeated: ${defeated}`);
        const timeSeconds = Math.floor((this.time.now - this.startTime) / 1000);
        this.hudTexts.timeAlive.setText(`Time Alive: ${timeSeconds}s`);
        this.hudTexts.life.setText(`Life: ${HUD_TEXTS.life}`);
        this.hudTexts.round.setText(`Round: ${this.currentRound}`);
    }

    handlePlayerEnemyCollision(player, enemy) {
        player.health -= this.enemyDamage;
        HUD_TEXTS.life = player.health;
        if (player.health <= 0) {
    const nickname = localStorage.getItem('nickname') || 'Anônimo';
    const survivalTime = Math.floor((this.time.now - this.startTime) / 1000);

    db.collection("scores").add({
        nickname: nickname,
        time: survivalTime,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        this.scene.restart();
    })
    .catch(err => {
        console.error('Failed to save score', err);
        this.scene.restart();
    });
}

    }

    spawnWave() {
        const enemyCount = this.currentRound * 5;
        createEnemies(this, enemyCount);
        this.enemiesTotal += enemyCount;
    }

}

export default Game;
