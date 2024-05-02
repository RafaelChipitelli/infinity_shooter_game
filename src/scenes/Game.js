import Phaser from "phaser";

class Game extends Phaser.Scene {
    preload() {
        // Carregue a imagem do quadrado (inimigo)
        // this.load.image('square', 'caminho/para/sua/imagem/quadrado.png');
    }

    create() {
        // Captura os eventos de teclado
        const cursors = this.input.keyboard.createCursorKeys();

        // Crie o jogador
        const player = this.add.circle(400, 250, 10, 0xffffffff, 1);
        this.physics.add.existing(player);
        player.body.setVelocity(0, 0);

        // Crie o inimigo
        const enemy = this.add.circle(500, 250, 10, 0xFF0000, 1);
        this.physics.add.existing(enemy);
        enemy.body.setVelocity(0, 0);

        // Defina a velocidade do jogador
        const playerSpeed = 150;
        let playerVelocityX = 0;
        let playerVelocityY = 0;

        // Defina a velocidade do inimigo
        const enemySpeed = 150;

        // Atualize a posição do jogador com base nas teclas de seta
        this.input.keyboard.on('keydown', (event) => {
            if (cursors.up.isDown) {
                playerVelocityY = -playerSpeed;
            }
            if (cursors.down.isDown) {
                playerVelocityY = playerSpeed;
            }
            if (cursors.left.isDown) {
                playerVelocityX = -playerSpeed;
            }
            if (cursors.right.isDown) {
                playerVelocityX = playerSpeed;
            }
        });

        this.input.keyboard.on('keyup', (event) => {
            if (!cursors.up.isDown && !cursors.down.isDown) {
                playerVelocityY = 0;
            }
            if (!cursors.left.isDown && !cursors.right.isDown) {
                playerVelocityX = 0;
            }
        });

        // Atualize a posição do jogador continuamente
        this.time.addEvent({
            delay: 16, // Ajuste o intervalo conforme necessário
            loop: true,
            callback: () => {
                player.body.setVelocity(playerVelocityX, playerVelocityY);
            }
        });

        // Atualize a posição do inimigo em direção ao jogador continuamente
        this.time.addEvent({
            delay: 100, // Ajuste o intervalo conforme necessário
            loop: true,
            callback: () => {
                const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
                enemy.body.setVelocity(
                    Math.cos(angle) * enemySpeed,
                    Math.sin(angle) * enemySpeed
                );
            }
        });
    }

    update() {
        // Lógica de atualização do jogo (se necessário)
    }
}

export default Game;
