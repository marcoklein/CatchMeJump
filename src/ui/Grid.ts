import * as Phaser from 'phaser';
import * as _ from 'underscore';

/**
 * Grid.
 */
export class Grid extends Phaser.GameObjects.Container {

    horizontalOffset: number = 10;
    /**
     * True to center all children.
     */
    centering: boolean = true;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
        super(scene, x, y);
        this.setSize(width, 0);
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
        if (this.centering) {
            // adjust start x to center content
            let totalChildrenWidth = 0;
            // calculate total width of all children
            this.list.forEach((object: any, index) => {
                totalChildrenWidth += object.width + this.horizontalOffset;//(index + 1 === this.list.length ? 0 : this.horizontalOffset);
            });

            // adjust start x
            currentX = totalChildrenWidth / this.list.length;
        }

        this.list.forEach((object: any, index) => {
            // adjust height if grid depending on added childs
            if (object.height > this.height) {
                this.height = object.height;
            }
            object.x = currentX;
            object.y = 0;
            currentX += object.width + this.horizontalOffset;
        });
    }

    

}