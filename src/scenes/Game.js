import Phaser from "phaser";

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
        this.projectiles = null;
        this.projectileSpeed = 300;
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys();

        this.player = this.add.circle(400, 250, 10, 0xffffffff, 1);
        this.physics.add.existing(this.player);
        this.player.body.setVelocity(0, 0);

        this.projectiles = this.physics.add.group();

        // grupo de inimigos para facilitar a colisão
        this.enemies = this.physics.add.group();

        // dispara um projétil a cada segundo mirando no inimigo mais próximo
        this.time.addEvent({
            delay: 1000,
            callback: this.fireProjectile,
            callbackScope: this,
            loop: true
        });

        // Criar vários inimigos
        for (let i = 0; i < 20; i++) {
            const enemy = this.add.circle(100 + i * 100, 100 + i * 100, 10, 0xFF0000, 1);
            this.physics.add.existing(enemy);
            enemy.body.setVelocity(0, 0);
            this.enemies.add(enemy);
        }

        // prevenir que os inimigos se sobreponham
        this.physics.add.collider(this.enemies, this.enemies);

        // movimentação será controlada diretamente no método update
    }

    fireProjectile() {
        if (this.enemies.getChildren().length === 0) {
            return;
        }

        const playerX = this.player.x;
        const playerY = this.player.y;

        let closestEnemy = null;
        let shortestDist = Infinity;
        this.enemies.getChildren().forEach(enemy => {
            const dist = Phaser.Math.Distance.Between(enemy.x, enemy.y, playerX, playerY);
            if (dist < shortestDist) {
                shortestDist = dist;
                closestEnemy = enemy;
            }
        });

        if (!closestEnemy) return;

        const projectile = this.add.circle(playerX, playerY, 5, 0x00ff00, 1);
        this.physics.add.existing(projectile);
        projectile.target = closestEnemy;
        projectile.body.setVelocity(0, 0);
        this.projectiles.add(projectile);
    }

    update() {
        // Calcula a velocidade do jogador com base no estado atual das teclas
        this.playerVelocityX = 0;
        this.playerVelocityY = 0;

        if (this.cursors.left.isDown && this.player.x > 50) {
            this.playerVelocityX = -this.playerSpeed;
        } else if (this.cursors.right.isDown && this.player.x < this.sys.canvas.width - 50) {
            this.playerVelocityX = this.playerSpeed;
        }

        if (this.cursors.up.isDown && this.player.y > 50) {
            this.playerVelocityY = -this.playerSpeed;
        } else if (this.cursors.down.isDown && this.player.y < this.sys.canvas.height - 50) {
            this.playerVelocityY = this.playerSpeed;
        }

        this.player.body.setVelocity(this.playerVelocityX, this.playerVelocityY);
        
        // Atualizar cada inimigo individualmente
        const playerX = this.player.x;
        const playerY = this.player.y;
        this.enemies.getChildren().forEach(enemy => {
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, playerX, playerY);
            enemy.body.setVelocity(
                Math.cos(angle) * this.enemySpeed,
                Math.sin(angle) * this.enemySpeed
            );
        });

        // força cada inimigo a manter distância dos outros
        this.separateEnemies();

        // Atualizar a direção de cada projétil em direção ao alvo
        this.projectiles.children.each(projectile => {
            if (!projectile.active || !projectile.target) return;
            if (!projectile.target.active) {
                projectile.destroy();
                return;
            }
            const angle = Phaser.Math.Angle.Between(projectile.x, projectile.y, projectile.target.x, projectile.target.y);
            projectile.body.setVelocity(
                Math.cos(angle) * this.projectileSpeed,
                Math.sin(angle) * this.projectileSpeed
            );

            // destruir projétil e inimigo se estiver muito próximo do alvo
            if (Phaser.Math.Distance.Between(projectile.x, projectile.y, projectile.target.x, projectile.target.y) < 10) {
                // remove inimigo da tela
                projectile.target.destroy();
                // remove inimigo do array de inimigos
                this.enemies = this.enemies.filter(e => e !== projectile.target);
                projectile.destroy();
            }

            const { width, height } = this.game.config;
            if (projectile.x < 0 || projectile.x > width || projectile.y < 0 || projectile.y > height) {
                projectile.destroy();
            }
        }, this);

        // Verificar se o jogador está tentando ultrapassar os limites do mapa
        const { width, height } = this.game.config;
        if (this.player.x < 50) {
            // Se o jogador está ultrapassando a borda esquerda, inverter a direção horizontal
            this.playerVelocityX = Math.abs(this.playerVelocityX) + this.playerSpeed;
        }
        if (this.player.x > width - 65) {
            // Se o jogador está ultrapassando a borda direita, inverter a direção horizontal
            this.playerVelocityX = -Math.abs(this.playerVelocityX) - this.playerSpeed;
        }
        if (this.player.y < 50) {
            // Se o jogador está ultrapassando a borda superior, inverter a direção vertical
            this.playerVelocityY = Math.abs(this.playerVelocityY) + this.playerSpeed;
        }
        if (this.player.y > height - 65) {
            // Se o jogador está ultrapassando a borda inferior, inverter a direção vertical
            this.playerVelocityY = -Math.abs(this.playerVelocityY) - this.playerSpeed;
        }
    }

    /**
     * Mantém os inimigos afastados uns dos outros para evitar sobreposição
     */
    separateEnemies() {
        const enemies = this.enemies.getChildren();
        for (let i = 0; i < enemies.length; i++) {
            const enemyA = enemies[i];
            for (let j = i + 1; j < enemies.length; j++) {
                const enemyB = enemies[j];
                const dist = Phaser.Math.Distance.Between(enemyA.x, enemyA.y, enemyB.x, enemyB.y);
                const minDist = 20;
                if (dist > 0 && dist < minDist) {
                    const overlap = minDist - dist;
                    const angle = Phaser.Math.Angle.Between(enemyB.x, enemyB.y, enemyA.x, enemyA.y);
                    const offsetX = Math.cos(angle) * (overlap / 2);
                    const offsetY = Math.sin(angle) * (overlap / 2);
                    enemyA.x += offsetX;
                    enemyA.y += offsetY;
                    enemyB.x -= offsetX;
                    enemyB.y -= offsetY;
                }
            }
        }
    }
}

export default Game;
