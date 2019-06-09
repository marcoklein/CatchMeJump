import * as Phaser from 'phaser';

/**
 * Panel to manage connected gamepads and keyboards for player control.
 */
export class InputDevicePanel extends Phaser.GameObjects.Container {

    backgroundImage: Phaser.GameObjects.Image;
    inputDeviceIcon: Phaser.GameObjects.Image;
    deviceNumberText: Phaser.GameObjects.Text;
    deviceNumber: number;

    constructor(scene: Phaser.Scene, deviceNumber: number, x?: number, y?: number) {
        super(scene, x, y);
        this.deviceNumber = deviceNumber;
        this.init();
        
        scene.add.existing(this);
    }

    private init() {
        // set size (same as background image)
        this.setSize(100, 100);
        // init images
        this.backgroundImage = this.scene.add.image(0, 0, 'ui_pack', 'grey_panel');
        this.inputDeviceIcon = this.scene.add.image(0, 0, 'ui_icons', 'question');
        this.inputDeviceIcon.setScale(0.7);
        
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
        this.scene.input.on('gameobjectup', this.onClick, this);

    }

    destroy() {
        super.destroy();

        // remove listeners
        this.scene.input.off('gameobjectup', this.onClick, this);
    }

    private onClick(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
        if (gameObject !== this) {
            return;
        }
        this.inputDeviceIcon.setTexture('keyboard_icon');
        this.inputDeviceIcon.setDisplaySize(80, 80);
        //this.inputDeviceIcon.setTexture('ui_icons', 'gamepad');
    }
}