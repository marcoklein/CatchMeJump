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
        // init images
        this.backgroundImage = this.scene.add.image(0, 0, 'ui_pack', 'grey_panel');
        this.inputDeviceIcon = this.scene.add.image(0, 0, 'ui_icons', 'plus');
        this.inputDeviceIcon.setScale(0.7);

        // add images
        this.add(this.backgroundImage);
        this.add(this.inputDeviceIcon);

        // set size
        this.setSize(this.backgroundImage.width, this.backgroundImage.height);

        // listen for clicks
        this.setInteractive();
        this.scene.input.on('gameobjectdown', this.onClick, this);

    }

    destroy() {
        super.destroy();

        // remove listeners
        this.scene.input.off('gameobjectdown', this.onClick, this);
    }

    private onClick(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) {
        if (gameObject !== this) {
            return;
        }
        this.inputDeviceIcon.setFrame('singleplayer');
    }
}