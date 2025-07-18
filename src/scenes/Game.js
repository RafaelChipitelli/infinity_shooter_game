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
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys('W,A,S,D');

        this.player = createPlayer(this);

        this.projectiles = this.physics.add.group();

        // grupo de inimigos para facilitar a colisão
        this.enemies = this.physics.add.group();

        // dispara um projétil a cada segundo mirando no inimigo mais próximo
        this.time.addEvent({
            delay: 1000,
            callback: () => fireProjectile(this),
            loop: true
        });

        // Criar vários inimigos
        createEnemies(this, 20);

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
    }

}

export default Game;
