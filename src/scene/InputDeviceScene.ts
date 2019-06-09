
import * as Phaser from 'phaser';
import { InputDevicePanel } from '../ui/InputDevicePanel';
import { ImageButton } from '../ui/ImageButton';
import { InputDeviceType, InputDeviceOptions } from '../game/GameConfig';
import { InputDeviceGrid } from '../ui/InputDeviceGrid';

/**
 * Manage adding and removing of controllers.
 */
export class InputDeviceScene extends Phaser.Scene {

    titleText: Phaser.GameObjects.Text;
    backgroundImage: Phaser.GameObjects.TileSprite;
    inputDeviceGrid: InputDeviceGrid;

    startButton: ImageButton;


    /**
     * Default keyboard configurations as input device.
     */
    defaultKeyboardConfigurations: InputDeviceOptions[] = [
        {
            type: InputDeviceType.KEYBOARD,
            keys: {
                left: 'A',
                right: 'D',
                action1: 'W',
                action2: 'E'
            }
        },
        {
            type: InputDeviceType.KEYBOARD,
            keys: {
                left: 'LEFT',
                right: 'RIGHT',
                action1: 'UP',
                action2: 'SPACE'
            }
        }
    ];
    usedKeyboards: number = 0;

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

        this.inputDeviceGrid = new InputDeviceGrid(this, 150, 150, 400);
        // add five panels
        for (let i = 0; i < 5; i++) {
            let panel = new InputDevicePanel(this, i + 1);
            panel.on('pointerup', () => {
                this.handleInputDevicePanelClick(panel);
            }, this);
            this.inputDeviceGrid.add(panel);
        }
        this.add.existing(this.inputDeviceGrid);

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

    private handleInputDevicePanelClick(panel: InputDevicePanel) {
        // count available keyboards
        if (panel.deviceType === null && this.usedKeyboards < this.defaultKeyboardConfigurations.length) {
            // add new keyboard
            panel.deviceType = InputDeviceType.KEYBOARD;
            panel.deviceOptions = this.defaultKeyboardConfigurations.shift();
        } else if (panel.deviceType === InputDeviceType.KEYBOARD) {
            // remove existing keyboard
            panel.deviceType = null;
            // add keyboard options to available list
            this.defaultKeyboardConfigurations.push(panel.deviceOptions);
            panel.deviceOptions = null;
        }
    }

}