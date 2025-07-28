import Phaser from "phaser";

import TitleScreen from "./scenes/TitleScreen";
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
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: { width: 360, height: 240 },
        max: { width: 1920, height: 1080 }
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

// Registra cenas
game.scene.add("titlescreen", TitleScreen);
game.scene.add("game", Game);

// Inicia com a tela de título
game.scene.start("titlescreen");
