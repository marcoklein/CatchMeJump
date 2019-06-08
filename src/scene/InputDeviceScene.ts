
import * as Phaser from 'phaser';

/**
 * Manage adding and removing of controllers.
 */
export class InputDeviceScene extends Phaser.Scene {

    backgroundImage: Phaser.GameObjects.TileSprite;


    constructor() {
        super({ key: 'ControllerScene' });
    }

    preload() {
        // load background
        this.load.image('background', 'assets/backgrounds/bg.png');
        // load html
        this.load.html('controller_frame', 'assets/html/controller_frame.html');
        // load ui
        this.load.atlas('ui_pack', 'assets/sprites/uipack.png', 'assets/sprites/uipack.json');
        this.load.atlas('ui_icons', 'assets/sprites/ui_icons.png', 'assets/sprites/ui_icons.json');
    }

    create() {
        // set background image
        this.backgroundImage = this.add.tileSprite(0, 0, this.game.scale.width * 2, this.game.scale.height * 2, 'background');


        // ensure game size is set properly
        this.scale.on('resize', (gameSize: {width: number; height: number}) => {
            this.cameras.resize(gameSize.width, gameSize.height);
            this.reposition();
        });


        // position all elements
        this.reposition();
    }

    private reposition() {
    }

}