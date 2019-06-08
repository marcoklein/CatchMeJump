import * as Phaser from 'phaser';

/**
 * Grid.
 */
export class Grid extends Phaser.GameObjects.Container {

    horizontalOffset: number = 10;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        this.setSize(width, height);

        // add self to scene
        scene.add.existing(this);
    }


    add(child: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]): Phaser.GameObjects.Container {
        super.add(child);
        this.refreshPositions();

        return this;
    }

    /**
     * Updates child positions after an update to the internal child list.
     */
    refreshPositions() {
        // TODO break into next row
        let currentX = 0;
        this.list.forEach((object: any, index) => {
            object.x = currentX;
            object.y = 0;
            currentX += object.width + this.horizontalOffset;
        });
    }

    

}