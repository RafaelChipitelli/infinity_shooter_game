import Phaser from "phaser";

class Game extends Phaser.Scene {
    constructor() {
        super();
        this.player = null;
        this.enemies = [];
        this.playerSpeed = 150;
        this.enemySpeed = 150;
        this.playerVelocityX = 0;
        this.playerVelocityY = 0;
    }

    create() {
        const cursors = this.input.keyboard.createCursorKeys();

        this.player = this.add.circle(400, 250, 10, 0xffffffff, 1);
        this.physics.add.existing(this.player);
        this.player.body.setVelocity(0, 0);

        // Criar vários inimigos
        for (let i = 0; i < 20; i++) {
            const enemy = this.add.circle(100 + (i)*100, 100 + (i)*100 , 10, 0xFF0000, 1);
            this.physics.add.existing(enemy);
            enemy.body.setVelocity(0, 0);
            this.enemies.push(enemy);
            
        }

        this.input.keyboard.on('keydown', (event) => {
            if (cursors.up.isDown && this.player.y > 50) {
                this.playerVelocityY = -this.playerSpeed;
            }
            if (cursors.down.isDown && this.player.y < this.sys.canvas.height - 50) {
                this.playerVelocityY = this.playerSpeed;
            }
            if (cursors.left.isDown && this.player.x > 50) {
                this.playerVelocityX = -this.playerSpeed;
            }
            if (cursors.right.isDown && this.player.x < this.sys.canvas.width - 50) {
                this.playerVelocityX = this.playerSpeed;
            }
        });

        this.input.keyboard.on('keyup', (event) => {
            if (!cursors.up.isDown && !cursors.down.isDown) {
                this.playerVelocityY = 0;
            }
            if (!cursors.left.isDown && !cursors.right.isDown) {
                this.playerVelocityX = 0;
            }
        });
    }

    update() {
        this.player.body.setVelocity(this.playerVelocityX, this.playerVelocityY);
        
        // Atualizar cada inimigo individualmente
        this.enemies.forEach(enemy => {
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
            enemy.body.setVelocity(
                Math.cos(angle) * this.enemySpeed,
                Math.sin(angle) * this.enemySpeed
            );
        });

        // Verificar se o jogador está tentando ultrapassar os limites do mapa
        if (this.player.x < 50) {
            // Se o jogador está ultrapassando a borda esquerda, inverter a direção horizontal
            this.playerVelocityX = Math.abs(this.playerVelocityX) + this.playerSpeed;
        }
        if (this.player.x > this.game.config.width - 65) {
            // Se o jogador está ultrapassando a borda direita, inverter a direção horizontal
            this.playerVelocityX = -Math.abs(this.playerVelocityX) - this.playerSpeed;
        }
        if (this.player.y < 50) {
            // Se o jogador está ultrapassando a borda superior, inverter a direção vertical
            this.playerVelocityY = Math.abs(this.playerVelocityY) + this.playerSpeed;
        }
        if (this.player.y > this.game.config.height - 65) {
            // Se o jogador está ultrapassando a borda inferior, inverter a direção vertical
            this.playerVelocityY = -Math.abs(this.playerVelocityY) - this.playerSpeed;
        }
    }
}

export default Game;
