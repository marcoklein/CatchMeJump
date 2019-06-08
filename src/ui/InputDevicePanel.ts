import * as Phaser from 'phaser';

/**
 * Panel to manage connected gamepads and keyboards for player control.
 */
export class InputDevicePanel extends Phaser.GameObjects.Container {

    backgroundImage: Phaser.GameObjects.Image;
    inputDeviceIcon: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x?: number, y?: number) {
        super(scene, x, y);
        scene.add.existing(this);
        this.init();
    }

    private init() {
        this.backgroundImage = this.scene.add.image(0, 0, 'ui_pack', 'grey_panel');
        this.inputDeviceIcon = this.scene.add.image(0, 0, 'ui_icons', 'plus');
        this.inputDeviceIcon.setScale(0.7);

        this.add(this.backgroundImage);
        this.add(this.inputDeviceIcon);


        this.setSize(this.backgroundImage.width, this.backgroundImage.height);
    }
}