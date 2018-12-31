
export abstract class InputController {
    actions: {
        left: boolean;
        right: boolean;
        jump: boolean;
        action1: boolean;
    }

    abstract update(input);
}

export class GamepadController extends InputController {
    padIndex: number;

    constructor(padIndex: number) {
        super();
        this.padIndex = padIndex;
    }

    update(input) {
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
        if (gamepad && gamepad.axes[0].value < -0.1) {
            // move left
            this.actions.left = true;
        } else if (gamepad && gamepad.axes[0].value > 0.1) {
            // move right
            this.actions.right = true;
        }
        // perform jump
        if (gamepad && gamepad.buttons[0].value === 1) {
            this.actions.jump = true;
        }
        // perform action1
        if (gamepad && gamepad.buttons[1].value === 1) {
            this.actions.action1 = true;
        }
    }
}

export class KeyboardController extends InputController {
    cursors: any;

    constructor(cursors) {
        super();
        this.cursors = cursors;
    }

    update(input) {
        // reset movements
        this.actions = {
            left: this.cursors.left.isDown,
            right: this.cursors.right.isDown,
            jump: this.cursors.up.isDown,
            action1: this.cursors.down.isDown
        }
    }
}
