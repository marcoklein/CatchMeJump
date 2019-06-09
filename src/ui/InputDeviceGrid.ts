import { Grid } from "./Grid";
import { InputDevicePanel } from "./InputDevicePanel";

export class InputDeviceGrid extends Grid {

    constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
        super(scene, x, y, width);
    }


    add(child: InputDevicePanel): Phaser.GameObjects.Container {
        return super.add(child);
    }
}