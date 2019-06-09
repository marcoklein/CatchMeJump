import * as Phaser from 'phaser';
import { InputType } from 'zlib';
import { InputDeviceType, InputDeviceOptions } from '../game/GameConfig';

/**
 * Panel to manage connected gamepads and keyboards for player control.
 */
export class InputDevicePanel extends Phaser.GameObjects.Container {

    backgroundImage: Phaser.GameObjects.Image;
    inputDeviceIcon: Phaser.GameObjects.Image;
    deviceNumberText: Phaser.GameObjects.Text;
    deviceNumber: number;
    /**
     * Device type for the input configuration.
     */
    private _deviceType: InputDeviceType = null;
    deviceOptions: InputDeviceOptions = null;

    constructor(scene: Phaser.Scene, deviceNumber: number, x?: number, y?: number) {
        super(scene, x, y);
        this.deviceNumber = deviceNumber;
        this.init();
    }

    private init() {
        // set size (same as background image)
        this.setSize(100, 100);
        // init images
        this.backgroundImage = this.scene.add.image(0, 0, 'ui_pack', 'grey_panel');
        this.inputDeviceIcon = this.scene.add.image(0, 0, 'ui_icons', 'question');
        this.deviceType = null; // update image
        
        // add images
        this.add(this.backgroundImage);
        this.add(this.inputDeviceIcon);

        // init text
        this.deviceNumberText = this.scene.add.text(this.width / 2 - 5, this.height / 2 - 5, '' + this.deviceNumber,
            {
                fontSize: '24px',
                fontStyle: 'bold',
                color: '#000'
            }
        );
        this.deviceNumberText.setOrigin(1, 1);

        // add text
        this.add(this.deviceNumberText);


        // listen for clicks
        this.setInteractive();
    }

    set deviceType(type: InputDeviceType) {
        if (type === undefined || type === null) {
            type = null;
            // reset icon
            this.inputDeviceIcon.setTexture('ui_icons', 'question');
            this.inputDeviceIcon.setDisplaySize(80, 80);
        }
        this._deviceType = type;

        if (type !== null) {
            if (type === InputDeviceType.KEYBOARD) {
                this.inputDeviceIcon.setTexture('keyboard_icon');
                this.inputDeviceIcon.setDisplaySize(80, 80);
            } else if (type === InputDeviceType.GAMEPAD) {
                this.inputDeviceIcon.setTexture('ui_icons', 'gamepad');
                this.inputDeviceIcon.setDisplaySize(80, 80);
            }
        }
    }

    get deviceType(): InputDeviceType {
        return this._deviceType;
    }
}