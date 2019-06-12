
export abstract class InputController {
    actions: {
        left: boolean;
        right: boolean;
        jump: boolean;
        action1: boolean;
    }

    abstract update(input);
}

/**
 * https://www.w3.org/TR/gamepad/#gamepad-interface
 */
export class GamepadController extends InputController {
    padIndex: number;

    constructor(padIndex: number) {
        super();
        this.padIndex = padIndex;
    }

    update(input: Phaser.Input.InputPlugin) {
        // reset movements
        this.actions = {
            left: false,
            right: false,
            jump: false,
            action1: false
        }

        let gamepad = input.gamepad.getPad(this.padIndex);
        //console.warn('No Gamepad at index %i found!', this.padIndex);
        // handle player movement
        if (gamepad) {
            if (gamepad.buttons[14].pressed || gamepad.axes[0].value < -0.1) {
                // move left
                this.actions.left = true;
            } else if (gamepad.buttons[15].pressed || gamepad.axes[0].value > 0.1) {
                // move right
                this.actions.right = true;
            }
            // perform jump
            if (gamepad.buttons[0].value === 1) {
                this.actions.jump = true;
            }
            // perform action1
            if (gamepad.buttons[1].value === 1) {
                this.actions.action1 = true;
            }
        }
    }
}

export class KeyboardController extends InputController {
    keys: { left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key; jump: Phaser.Input.Keyboard.Key; action1: Phaser.Input.Keyboard.Key; };

    constructor(input: Phaser.Input.InputPlugin, keys: { left: string; right: string; jump: string; action1: string; }) {
        super();
        this.keys = {
            left: input.keyboard.addKey(keys.left),
            right: input.keyboard.addKey(keys.right),
            jump: input.keyboard.addKey(keys.jump),
            action1: input.keyboard.addKey(keys.action1)
        };
    }

    update(input: Phaser.Input.InputPlugin) {
        // reset movements
        this.actions = {
            left: this.keys.left.isDown,
            right: this.keys.right.isDown,
            jump: this.keys.jump.isDown,
            action1: this.keys.action1.isDown
        }
    }
}