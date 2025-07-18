export function createEnemies(scene, count) {
    for (let i = 0; i < count; i++) {
        const enemy = scene.add.circle(100 + i * 100, 100 + i * 100, 10, 0xFF0000, 1);
        scene.physics.add.existing(enemy);
        enemy.body.setVelocity(0, 0);
        scene.enemies.add(enemy);
    }
}

export function updateEnemies(scene) {
    const playerX = scene.player.x;
    const playerY = scene.player.y;
    scene.enemies.getChildren().forEach(enemy => {
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, playerX, playerY);
        enemy.body.setVelocity(
            Math.cos(angle) * scene.enemySpeed,
            Math.sin(angle) * scene.enemySpeed
        );
    });
}

export function separateEnemies(scene) {
    const enemies = scene.enemies.getChildren();
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
