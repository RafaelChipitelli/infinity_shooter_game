import Phaser from "phaser";

import TitleScreen from "./scenes/TitleScreen";
import LoginScreen from "./scenes/LoginScreen";
import RegisterScreen from "./scenes/RegisterScreen";
import Game from "./scenes/Game";

// Defina dimensões priorizando sempre a orientação horizontal
let width = Math.max(window.innerWidth, window.innerHeight);
let height = Math.min(window.innerWidth, window.innerHeight);

const config = {
    width: width,
    height: height,
    type: Phaser.AUTO,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: true
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    // 🧩 Ativa suporte para DOM Elements (como input de nickname)
    dom: {
        createContainer: true,
        pointerEvents: 'auto'
    }
};

const game = new Phaser.Game(config);

// Tenta bloquear a orientação para horizontal quando suportado
if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(() => {});
}

// Ajusta tamanho caso a tela seja redimensionada
window.addEventListener('resize', () => {
    width = Math.max(window.innerWidth, window.innerHeight);
    height = Math.min(window.innerWidth, window.innerHeight);
    game.scale.resize(width, height);
});

// Registra cenas
game.scene.add("titlescreen", TitleScreen);
game.scene.add("loginscreen", LoginScreen);
game.scene.add("registerscreen", RegisterScreen);
game.scene.add("game", Game);

// Inicia com a tela de login
game.scene.start("loginscreen");
