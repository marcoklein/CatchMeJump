import { Grid } from "./Grid";
import { InputDevicePanel } from "./InputDevicePanel";

export class InputDeviceGrid extends Grid {

    constructor(scene: Phaser.Scene, x: number, y: number, width: number) {
        super(scene, x, y, width);
    }


    /**
     * Add a new input device panel.
     * 
     * @param child 
     */
    add(child: InputDevicePanel): Phaser.GameObjects.Container {
        return super.add(child);
    }

    /**
     * Loop through all panels and find the index of a panel that has no input configuration.
     */
    findNextFreePanelIndex(): number {
        let panels: InputDevicePanel[] = <InputDevicePanel[]> this.list;
        for (let i = 0; i < panels.length; i++) {
            if (!panels[i].deviceOptions) {
                return i;
            }
        }
        return -1;
    }
    
    /**
     * Loop through all panels and find the index of a panel that has no input configuration.
     */
    findNextFreePanel(): InputDevicePanel {
        let panels: InputDevicePanel[] = <InputDevicePanel[]> this.list;
        for (let i = 0; i < panels.length; i++) {
            if (!panels[i].deviceOptions) {
                return panels[i];
            }
        }
        return null;
    }
    
}