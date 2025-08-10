import Phaser from "phaser";
import {
    createPlayer,
    updatePlayerMovement,
    enforcePlayerBounds
} from "./helpers/player";
import {
    createEnemies,
    updateEnemies,
    separateEnemies,
    createShooterEnemies,
    updateShooterEnemies
} from "./helpers/enemies";
import { fireProjectile, updateProjectiles, updateEnemyBullets } from "./helpers/projectiles";
import { HUD_TEXTS } from "./HUDConstants";
import { db, firebase, auth, FieldValue } from "../firebase";

const BG_TILE_KEY = 'bg-tile';

function createDynamicTileTexture(scene) {
    if (scene.textures.exists(BG_TILE_KEY)) {
        return;
    }
    const size = 64;
    const texture = scene.textures.createCanvas(BG_TILE_KEY, size, size);
    const ctx = texture.getContext();
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#1a1a1a';
    for (let y = 0; y < size; y += 16) {
        for (let x = 0; x < size; x += 16) {
            ctx.fillRect(x + 6, y + 6, 2, 2);
        }
    }
    texture.refresh();
}


class Game extends Phaser.Scene {
    constructor() {
        super();
        this.player = null;
        this.enemies = null;
        this.shooters = null;
        this.enemyBullets = null;
        this.playerSpeed = 150;
        this.enemySpeed = 150;
        this.enemyBulletSpeed = 200;
        this.playerBulletSpeed = 300;
        this.playerVelocityX = 0;
        this.playerVelocityY = 0;
        this.cursors = null;
        this.wasdKeys = null;
        this.projectiles = null;
        this.projectileSpeed = 300;
        this.projectileDamage = HUD_TEXTS.dps;

        this.playerInitialHealth = HUD_TEXTS.life;
        this.enemyDamage = 100;

        this.playerSkinUrl = null;
        this.useSprite = false;

        this.touchPointer = null;

        this.hudTexts = {};
        this.enemiesTotal = 0;
        this.startTime = 0;
        this.currentRound = 1;
        this.nextWaveScheduled = false;
        this.isGameOver = false;

        // Session tracking
        this.sessionStart = 0;
        this.enemiesKilledSess = 0;
    }

    preload() {
        const user = this.registry.get('currentUser');
        const url = user && user.botttsSkinUrl;
        if (url) {
            this.playerSkinUrl = url;
            this.load.image('playerSkin', url);
            this.useSprite = true;
        }
    }

    init() {
        // Initialize per-session counters
        this.sessionStart = Date.now();
        this.enemiesKilledSess = 0;
        HUD_TEXTS.gold = 0;
    }

    create() {
        createDynamicTileTexture(this);

        const { width, height } = this.scale;
        this.bgFar = this.add.tileSprite(0, 0, width, height, BG_TILE_KEY).setOrigin(0, 0);
        this.bgFar.setScrollFactor(0);
        this.bgFar.setDepth(-2);

        this.bgNear = this.add.tileSprite(0, 0, width, height, BG_TILE_KEY).setOrigin(0, 0);
        this.bgNear.setScrollFactor(0);
        this.bgNear.setDepth(-1);

        // Ajusta a viewport e os backgrounds em redimensionamentos
        this.scale.on('resize', (size) => {
            this.cameras.main.setViewport(0, 0, size.width, size.height);
            this.bgFar.setSize(size.width, size.height);
            this.bgNear.setSize(size.width, size.height);
        });

        // Limites iniciais da câmera caso o mapa ultrapasse a tela
        this.cameras.main.setBounds(
            0,
            0,
            this.game.config.width,
            this.game.config.height
        );
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D');

        if (this.useSprite) {
            this.player = this.physics.add.sprite(400, 250, 'playerSkin');
            this.player.setDisplaySize(20, 20);
            this.player.health = this.playerInitialHealth;
        } else {
            this.player = createPlayer(this);
        }
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

        this.shooters = this.physics.add.group();
        this.enemyBullets = this.physics.add.group();

        // grupo de inimigos para facilitar a colisão
        this.enemies = this.physics.add.group();

        this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);
        this.physics.add.overlap(this.player, this.shooters, this.handlePlayerEnemyCollision, null, this);
        this.physics.add.overlap(this.player, this.enemyBullets, this.handlePlayerBulletCollision, null, this);

        // dispara um projétil a cada segundo mirando no inimigo mais próximo
        this.time.addEvent({
            delay: 1000,
            callback: () => fireProjectile(this),
            loop: true
        });

        // Inicializa primeira onda de inimigos
        this.spawnWave();

        // Inicializa HUD
        // Use real world time to avoid persistence across scene restarts
        this.startTime = Date.now();
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

    update(time, delta) {
        updatePlayerMovement(this);

        const vx = this.player.body.velocity.x;
        const vy = this.player.body.velocity.y;
        const dt = delta / 1000;
        const farFactor = 0.15;
        const nearFactor = 0.35;
        this.bgFar.tilePositionX += vx * farFactor * dt;
        this.bgFar.tilePositionY += vy * farFactor * dt;
        this.bgNear.tilePositionX += vx * nearFactor * dt;
        this.bgNear.tilePositionY += vy * nearFactor * dt;

        updateEnemies(this);
        separateEnemies(this);
        updateShooterEnemies(this);
        updateProjectiles(this);
        updateEnemyBullets(this);
        enforcePlayerBounds(this);

        // Atualiza valores do HUD
        const alive = this.enemies.countActive(true) + this.shooters.countActive(true);
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
        const timeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        this.hudTexts.timeAlive.setText(`Time Alive: ${timeSeconds}s`);
        this.hudTexts.life.setText(`Life: ${HUD_TEXTS.life}`);
        this.hudTexts.round.setText(`Round: ${this.currentRound}`);
    }

    async handlePlayerEnemyCollision(player, enemy) {
        if (this.isGameOver) {
            return;
        }

        player.health = Math.max(player.health - this.enemyDamage, 0);
        HUD_TEXTS.life = player.health;

        if (player.health <= 0) {
            this.isGameOver = true;

            // ensure gold reflects total enemies killed this session
            HUD_TEXTS.gold = Math.floor(this.enemiesKilledSess / 10);

            const nickname = localStorage.getItem('nickname') || 'Anônimo';
            const survivalTime = Math.floor((Date.now() - this.startTime) / 1000);

            try {
                db.collection("scores").add({
                    nickname: nickname,
                    time: survivalTime,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (err) {
                console.error('Failed to save score', err);
            }

            // Update user statistics
            try {
                const user = (auth && auth.currentUser) || this.registry?.get?.('user');
                if (user) {
                    await db
                        .collection('users')
                        .doc(user.uid)
                        .set(
                            {
                                totalTimeAlive: firebase.firestore.FieldValue.increment(Math.floor((Date.now() - this.sessionStart) / 1000)),
                                totalEnemiesKilled: firebase.firestore.FieldValue.increment(this.enemiesKilledSess),
                                gold: firebase.firestore.FieldValue.increment(HUD_TEXTS.gold)
                            },
                            { merge: true }
                        );
                }
            } catch (err) {
                console.error('Failed to update user stats', err);
            }

            this.resetGameParams();
            this.scene.start('titlescreen');
        }

    }

    async handlePlayerBulletCollision(player, bullet) {
        if (this.isGameOver) return;
        bullet.destroy();
        await this.handlePlayerEnemyCollision(player, bullet);
    }

    resetGameParams() {
        HUD_TEXTS.score = 0;
        HUD_TEXTS.round = 1;
        HUD_TEXTS.enemiesAlive = 1;
        HUD_TEXTS.life = 100;
        HUD_TEXTS.dps = 1;
        HUD_TEXTS.gold = 0;

        this.currentRound = 1;
        this.enemiesTotal = 0;
        this.playerInitialHealth = HUD_TEXTS.life;
        this.projectileDamage = HUD_TEXTS.dps;
        this.isGameOver = false;
        this.startTime = Date.now();
    }

    spawnWave() {
        const enemyCount = this.currentRound * 5;
        createEnemies(this, enemyCount);
        const shooterCount = this.currentRound;
        createShooterEnemies(this, shooterCount);
        this.enemiesTotal += enemyCount + shooterCount;
    }

}

export default Game;
