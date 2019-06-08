
import * as Phaser from 'phaser';
import { InputDevicePanel } from '../ui/InputDevicePanel';
import { Grid } from '../ui/Grid';

/**
 * Manage adding and removing of controllers.
 */
export class InputDeviceScene extends Phaser.Scene {

    titleText: Phaser.GameObjects.Text;
    backgroundImage: Phaser.GameObjects.TileSprite;
    inputDeviceGrid: Grid;


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

        this.titleText = this.add.text(this.scale.width / 2, 20, 'Input Devices', { fontStyle: 'bold', fontSize: '32px', fontFamily: '"Roboto Condensed"', color: '#000'});

        // ensure game size is set properly
        this.scale.on('resize', (gameSize: {width: number; height: number}) => {
            this.cameras.resize(gameSize.width, gameSize.height);
            this.reposition(gameSize.width, gameSize.height);
        });

        this.inputDeviceGrid = new Grid(this, 150, 150, 400, 400);
        this.inputDeviceGrid.add(new InputDevicePanel(this));
        this.inputDeviceGrid.add(new InputDevicePanel(this));
        this.inputDeviceGrid.add(new InputDevicePanel(this));
        this.inputDeviceGrid.add(new InputDevicePanel(this));
        this.inputDeviceGrid.add(new InputDevicePanel(this));

        // position all elements
        this.reposition(this.scale.width, this.scale.height);
    }

    private reposition(width: number, height: number) {
        // position title text on top
        this.titleText.setPosition(
            width / 2 - this.titleText.width / 2,
            20
        );
        this.inputDeviceGrid.width = width * 0.8;
        this.inputDeviceGrid.x = width / 2 - this.inputDeviceGrid.width / 2;
    }

}