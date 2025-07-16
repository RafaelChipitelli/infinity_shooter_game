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
        this.cursors = null;
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys();

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

        // movimentação será controlada diretamente no método update
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
        this.enemies.forEach(enemy => {
            const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, playerX, playerY);
            enemy.body.setVelocity(
                Math.cos(angle) * this.enemySpeed,
                Math.sin(angle) * this.enemySpeed
            );
        });

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
}

export default Game;
