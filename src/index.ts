
/// <reference path="../devDependencies/phaser.d.ts" />
import * as Phaser from 'phaser';
import * as _ from 'underscore';

import { GameScene } from './GameScene';
import { HudScene } from './HudScene';



var config = {
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
            debug: true
        }
    },
    scene: [GameScene, HudScene],
    input: {
        gamepad: true
    }
};

// phaser game object
var game = new Phaser.Game(config);

