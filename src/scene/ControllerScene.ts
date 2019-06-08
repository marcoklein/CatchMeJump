
import * as Phaser from 'phaser';
import * as $ from 'jquery';
import { PlayerControllerContainer } from '../ui/elements/PlayerControllerContainer';

/**
 * Manage adding and removing of controllers.
 */
export class ControllerScene extends Phaser.Scene {

    backgroundImage: Phaser.GameObjects.TileSprite;

    inputDevicesHTML: Phaser.GameObjects.DOMElement;

    constructor() {
        super({ key: 'ControllerScene' });
    }

    preload() {
        // load background
        this.load.image('background', 'assets/backgrounds/bg.png');
        // load html
        this.load.html('controller_frame', 'assets/html/controller_frame.html');
    }

    create() {

        // load game scene to display player information
        //this.gameScene = <GameScene> this.game.scene.getScene('GameScene');

        // set background image
        this.backgroundImage = this.add.tileSprite(0, 0, this.game.scale.width * 2, this.game.scale.height * 2, 'background');


        // ensure game size is set properly
        this.scale.on('resize', (gameSize: {width: number; height: number}) => {
            this.cameras.resize(gameSize.width, gameSize.height);
            this.reposition();
        });

        // show html
        this.inputDevicesHTML = this.add.dom(this.game.canvas.width / 2, this.game.canvas.height / 5).createFromCache('controller_frame');

    }

    private reposition() {
        this.inputDevicesHTML.setPosition(this.game.canvas.width / 2, this.game.canvas.height / 5);
        this.backgroundImage.width = this.game.scale.width * 2;
        this.backgroundImage.height = this.game.scale.height * 2;
    }

}