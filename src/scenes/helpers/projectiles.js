export function fireProjectile(scene) {
    if (scene.enemies.getChildren().length === 0) {
        return;
    }

    const playerX = scene.player.x;
    const playerY = scene.player.y;

    let closestEnemy = null;
    let shortestDistSq = Infinity;
    scene.enemies.getChildren().forEach(enemy => {
        const distSq = Phaser.Math.Distance.Squared(enemy.x, enemy.y, playerX, playerY);
        if (distSq < shortestDistSq) {
            shortestDistSq = distSq;
            closestEnemy = enemy;
        }
    });

    if (!closestEnemy) return;

    const projectile = scene.add.circle(playerX, playerY, 5, 0x00ff00, 1);
    scene.physics.add.existing(projectile);
    projectile.target = closestEnemy;
    projectile.body.setVelocity(0, 0);
    projectile.damage = scene.projectileDamage || 1;
    scene.projectiles.add(projectile);
}

export function updateProjectiles(scene) {
    scene.projectiles.children.each(projectile => {
        if (!projectile.active || !projectile.target) return;
        if (!projectile.target.active) {
            projectile.destroy();
            return;
        }
        const angle = Phaser.Math.Angle.Between(
            projectile.x,
            projectile.y,
            projectile.target.x,
            projectile.target.y
        );
        projectile.body.setVelocity(
            Math.cos(angle) * scene.projectileSpeed,
            Math.sin(angle) * scene.projectileSpeed
        );

        if (
            Phaser.Math.Distance.Squared(
                projectile.x,
                projectile.y,
                projectile.target.x,
                projectile.target.y
            ) < 100
        ) {
            projectile.target.destroy();
            scene.enemies.remove(projectile.target, true, true);
            projectile.destroy();
        }

        const { width, height } = scene.game.config;
        if (projectile.x < 0 || projectile.x > width || projectile.y < 0 || projectile.y > height) {
            projectile.destroy();
        }
    }, scene);
}
