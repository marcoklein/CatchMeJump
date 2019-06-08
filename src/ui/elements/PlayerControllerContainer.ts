import * as Phaser from 'phaser';

export class PlayerControllerContainer extends Phaser.GameObjects.DOMElement {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.init();
        scene.add.existing(this);
    }

    private init() {

        this.scene.add.dom(50, 200).createFromHTML('<h1>Hallo</h1>');
    }

}