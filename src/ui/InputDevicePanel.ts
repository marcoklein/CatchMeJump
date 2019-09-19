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

    keyboardButtonsText: Phaser.GameObjects.Text;

    private _deviceOptions: InputDeviceOptions = null;

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
        this.deviceOptions = null; // update image
        
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
        this.deviceNumberText.setDepth(10000);
        this.deviceNumberText.setOrigin(1, 1);

        // add text
        this.add(this.deviceNumberText);


        // listen for clicks
        this.setInteractive();
    }

    set deviceOptions(deviceOptions: InputDeviceOptions) {
        if (deviceOptions === undefined || deviceOptions === null) {
            // reset icon
            this.inputDeviceIcon.setTexture('ui_icons', 'question');
            this.inputDeviceIcon.setDisplaySize(80, 80);
        }
        this._deviceOptions = deviceOptions;

        if (this.keyboardButtonsText) {
            this.keyboardButtonsText.destroy();
            this.keyboardButtonsText = null;
        }

        this.inputDeviceIcon.alpha = 1;
        if (deviceOptions !== null) {
            if (deviceOptions.type === InputDeviceType.KEYBOARD) {
                this.inputDeviceIcon.setTexture('keyboard_icon');
                this.inputDeviceIcon.setDisplaySize(80, 80);
                this.inputDeviceIcon.alpha = 0.2;

                // print keyboard button underneath
                this.keyboardButtonsText = this.scene.add.text(
                    0, 0,
                    'Keyboard:\n' + this.deviceOptions.keys.left + ', ' +
                    this.deviceOptions.keys.right + ', ' +
                    this.deviceOptions.keys.jump + ', ' +
                    this.deviceOptions.keys.action1,
                    { fontStyle: 'bold', color: 'black', fontSize: '14px', wordWrap: { width: this.width } }
                );
                //this.keyboardButtonsText.setBackgroundColor("#ffffffaa")
                this.keyboardButtonsText.setDepth(100);
                this.keyboardButtonsText.setOrigin(0.5, 0.5);
                this.add(this.keyboardButtonsText);
                // depth property is not working with containers
                // therefore move text down
                this.moveDown(this.keyboardButtonsText);

            } else if (deviceOptions.type === InputDeviceType.GAMEPAD) {
                this.inputDeviceIcon.setTexture('ui_icons', 'gamepad');
                this.inputDeviceIcon.setDisplaySize(80, 80);
            }
        }
    }
    get deviceOptions(): InputDeviceOptions {
        return this._deviceOptions;
    }
}