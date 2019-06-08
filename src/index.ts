
//// <reference path="../devDependencies/phaser.d.ts" />
import * as Phaser from 'phaser';
import * as _ from 'underscore';

import { MainScene } from './MainScene';
import { InputDeviceScene } from './scene/InputDeviceScene';

import Plugins from './plugins/rexuiplugin.min.js';

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
    parent: '#game',
    type: Phaser.AUTO,
    backgroundColor: '#222',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 900 },
            debug: true,
            tileBias: 70 // prevent falling through tiles... (tile size of tilemap)
            //overlapBias: 16
        }
    },
    dom: {
        createContainer: true
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600,
        min: {
            width: 400,
            height: 300
        },
        max: {
            width: 1600,
            height: 1200
        }
    },
    plugins: {
        global: [
            { key: 'rexuiplugin', plugin: Plugins}
        ]
    },
    input: {
        gamepad: true
    }
};


// phaser game object
var game = new Phaser.Game(config);
game.scene.add('InputDeviceScene', InputDeviceScene, true);
