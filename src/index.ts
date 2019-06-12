
//// <reference path="../devDependencies/phaser.d.ts" />
import * as Phaser from 'phaser';
import * as _ from 'underscore';

import { MainScene } from './scene/MainScene';
import { PreloadScene } from './scene/PreloadScene';

/*let config: GameConfig = {
    type: Phaser.AUTO,
    parent: 'CatchMeJump',
    width: 400,
    height: 600,
    backgroundColor: '#222',
    // enable physics
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            //debug: true
        }
    },
    scene: [MainScene],
    input: {
        gamepad: true
    }
};*/

var config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    backgroundColor: '#222',
    fps: {
        target: 60
    },
    dom: {
        createContainer: true
    },
    scale: {
        parent: '#game',
        mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 960,
        height: 640,
        min: {
            width: 400,
            height: 300
        },
        max: {
            width: 1600,
            height: 1200
        }
    },
    input: {
        gamepad: true
    },
    scene: [
        PreloadScene, MainScene
    ]
};


// phaser game object
var game = new Phaser.Game(config);
game.scene.add('PreloadScene', PreloadScene, true);
