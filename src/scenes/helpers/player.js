export function createPlayer(scene) {
    const player = scene.add.circle(400, 250, 10, 0xffffff, 1);
    scene.physics.add.existing(player);
    player.body.setVelocity(0, 0);
    return player;
}

export function updatePlayerMovement(scene) {
    scene.playerVelocityX = 0;
    scene.playerVelocityY = 0;

    const leftPressed = scene.cursors.left.isDown || scene.wasdKeys.A.isDown;
    const rightPressed = scene.cursors.right.isDown || scene.wasdKeys.D.isDown;
    const upPressed = scene.cursors.up.isDown || scene.wasdKeys.W.isDown;
    const downPressed = scene.cursors.down.isDown || scene.wasdKeys.S.isDown;


    if (leftPressed && scene.player.x > 50) {
        scene.playerVelocityX = -scene.playerSpeed;
    } else if (rightPressed && scene.player.x < scene.sys.canvas.width - 50) {
        scene.playerVelocityX = scene.playerSpeed;
    }

    if (upPressed && scene.player.y > 50) {
        scene.playerVelocityY = -scene.playerSpeed;
    } else if (downPressed && scene.player.y < scene.sys.canvas.height - 50) {
        scene.playerVelocityY = scene.playerSpeed;
    }

    // Controles por toque: mover o jogador na direção do toque
    if (scene.touchPointer) {
        const angle = Phaser.Math.Angle.Between(
            scene.player.x,
            scene.player.y,
            scene.touchPointer.worldX,
            scene.touchPointer.worldY
        );
        scene.playerVelocityX = Math.cos(angle) * scene.playerSpeed;
        scene.playerVelocityY = Math.sin(angle) * scene.playerSpeed;
    }

    scene.player.body.setVelocity(scene.playerVelocityX, scene.playerVelocityY);
}

export function enforcePlayerBounds(scene) {
    const { width, height } = scene.game.config;
    if (scene.player.x < 50) {
        scene.playerVelocityX = Math.abs(scene.playerVelocityX) + scene.playerSpeed;
    }
    if (scene.player.x > width - 65) {
        scene.playerVelocityX = -Math.abs(scene.playerVelocityX) - scene.playerSpeed;
    }
    if (scene.player.y < 50) {
        scene.playerVelocityY = Math.abs(scene.playerVelocityY) + scene.playerSpeed;
    }
    if (scene.player.y > height - 65) {
        scene.playerVelocityY = -Math.abs(scene.playerVelocityY) - scene.playerSpeed;
    }
}
