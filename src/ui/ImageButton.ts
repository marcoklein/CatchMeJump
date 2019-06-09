
/**
 * Simple button that uses images.
 */
export class ImageButton extends Phaser.GameObjects.Image {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame: string | number, onClickCallback: Function) {
        super(scene, x, y, texture, frame);

        this.setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.enterButtonHoverState())
            .on('pointerout', () => this.enterButtonRestState())
            .on('pointerdown', () => this.enterButtonActiveState())
            .on('pointerup', () => {
                this.enterButtonHoverState();
                onClickCallback();
            });
        this.enterButtonRestState();
    }

    enterButtonHoverState() {
        this.setTintFill(0x888);
    }

    enterButtonRestState() {
        this.clearTint();
    }

    enterButtonActiveState() {
        this.setTintFill(0xfff);
    }
}