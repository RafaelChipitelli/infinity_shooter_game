export function fireProjectile(scene) {
    if (
        scene.enemies.getChildren().length === 0 &&
        scene.shooters.getChildren().length === 0
    ) {
        return;
    }

    const playerX = scene.player.x;
    const playerY = scene.player.y;

    let closestEnemy = null;
    let shortestDistSq = Infinity;
    const potentialTargets = [
        ...scene.enemies.getChildren(),
        ...scene.shooters.getChildren()
    ];
    potentialTargets.forEach(enemy => {
        const distSq = Phaser.Math.Distance.Squared(
            enemy.x,
            enemy.y,
            playerX,
            playerY
        );
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
            if (projectile.target.shootEvent) {
                scene.time.removeEvent(projectile.target.shootEvent);
            }
            projectile.target.destroy();
            scene.enemies.remove(projectile.target, true, true);
            scene.shooters.remove(projectile.target, true, true);
            projectile.destroy();
        }

        const { width, height } = scene.game.config;
        if (projectile.x < 0 || projectile.x > width || projectile.y < 0 || projectile.y > height) {
            projectile.destroy();
        }
    }, scene);
}

export function fireShooterProjectile(scene, shooter) {
    const projectile = scene.add.circle(shooter.x, shooter.y, 4, 0xFFA500, 1);
    scene.physics.add.existing(projectile);

    // Add the projectile to the group first so the group's create
    // handler does not overwrite its velocity afterwards.
    scene.enemyBullets.add(projectile);

    const angle = Phaser.Math.Angle.Between(
        shooter.x,
        shooter.y,
        scene.player.x,
        scene.player.y
    );

    // Ensure the bullet travels with a fixed velocity towards the
    // player's position at the moment of the shot.
    scene.physics.velocityFromRotation(
        angle,
        scene.playerBulletSpeed,
        projectile.body.velocity
    );
}

export function updateEnemyBullets(scene) {
    scene.enemyBullets.getChildren().forEach(projectile => {
        const { width, height } = scene.game.config;
        if (
            projectile.x < 0 || projectile.x > width ||
            projectile.y < 0 || projectile.y > height
        ) {
            projectile.destroy();
        }
    });
}
