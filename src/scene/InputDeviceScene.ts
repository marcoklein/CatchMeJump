
import * as Phaser from 'phaser';
import { InputDevicePanel } from '../ui/InputDevicePanel';
import { Grid } from '../ui/Grid';
import { ImageButton } from '../ui/ImageButton';

/**
 * Manage adding and removing of controllers.
 */
export class InputDeviceScene extends Phaser.Scene {

    titleText: Phaser.GameObjects.Text;
    backgroundImage: Phaser.GameObjects.TileSprite;
    inputDeviceGrid: Grid;

    startButton: ImageButton;


    constructor() {
        super({ key: 'ControllerScene' });
    }

    preload() {
        // load background
        this.load.image('background', 'assets/backgrounds/bg.png');
        // load html
        this.load.html('controller_frame', 'assets/html/controller_frame.html');
        // load ui
        this.load.image('keyboard_icon', 'assets/sprites/keyboard.png');
        this.load.atlas('ui_pack', 'assets/sprites/uipack.png', 'assets/sprites/uipack.json');
        this.load.atlas('ui_icons', 'assets/sprites/ui_icons.png', 'assets/sprites/ui_icons.json');
    }

    create() {
        // set background image
        this.backgroundImage = this.add.tileSprite(0, 0, this.game.scale.width * 2, this.game.scale.height * 2, 'background');

        // add title
        this.titleText = this.add.text(this.scale.width / 2, 20, 'Input Devices', { fontStyle: 'bold', fontSize: '32px', fontFamily: '"Roboto Condensed"', color: '#000'});

        // add buttons
        this.startButton = new ImageButton(this, 0, 0, 'ui_icons', 'buttonStart', () => {
            console.log('start button clicked');
        });
        this.add.existing(this.startButton);


        // ensure game size is set properly
        this.scale.on('resize', (gameSize: {width: number; height: number}) => {
            this.cameras.resize(gameSize.width, gameSize.height);
            this.reposition(gameSize.width, gameSize.height);
        });

        this.inputDeviceGrid = new Grid(this, 150, 150, 400);
        this.inputDeviceGrid.add(new InputDevicePanel(this, 1));
        this.inputDeviceGrid.add(new InputDevicePanel(this, 2));
        this.inputDeviceGrid.add(new InputDevicePanel(this, 3));
        this.inputDeviceGrid.add(new InputDevicePanel(this, 4));
        this.inputDeviceGrid.add(new InputDevicePanel(this, 5));

        // position all elements
        this.reposition(this.scale.width, this.scale.height);
    }

    private reposition(width: number, height: number) {
        // position title text on top
        this.titleText.setPosition(
            width / 2 - this.titleText.width / 2,
            20
        );

        // position grid
        this.inputDeviceGrid.width = width * 0.8;
        this.inputDeviceGrid.x = width / 2 - this.inputDeviceGrid.width / 2;

        // position start button under grid
        this.startButton.setPosition(
            width * 0.5,
            this.inputDeviceGrid.y + this.inputDeviceGrid.height
        );
    }

}