import Phaser from "phaser";

import TitleScreen from "./scenes/TitleScreen";
import Game from "./scenes/Game";

// Obtenha as dimensões da tela do computador
const width = window.innerWidth;
const height = window.innerHeight;

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
    }
}

const game = new Phaser.Game(config)

game.scene.add("titlescreen", TitleScreen)
game.scene.add("game", Game)

// game.scene.start("titlescreen")
game.scene.start("game")