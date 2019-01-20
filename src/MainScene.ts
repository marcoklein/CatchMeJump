import { GameScene } from "./GameScene";
import { HudScene } from "./HudScene";
import { TextButton } from "./TextButton";

/**
 * Starting scene allowing player to make game configurations and enter the game.
 */
export class MainScene extends Phaser.Scene {

    gameFinishedText: Phaser.GameObjects.Text;

    // user interface
    incrementButton: TextButton;
    decrementButton: TextButton;
    playerCountText: Phaser.GameObjects.Text;


    constructor() {
        super('MainScene');
    }

    create() {

        // be sure to set default registry keys
        if (!this.registry.get('playerCount')) {
            // two players per default
            this.registry.set('playerCount', 2);
        }



        this.gameFinishedText = this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2, 'Get ready!', { font: '64px Arial', fill: '#DDD' });
        this.gameFinishedText.setOrigin(0.5);


        this.playerCountText = this.add.text(100, 200, '');

        this.incrementButton = new TextButton(this, 100, 100, 'Increment Count', { fill: '#0f0 ' }, () => this.incrementClickCount());
        this.add.existing(this.incrementButton);

        this.decrementButton = new TextButton(this, 100, 150, 'Decrement Count', { fill: '#0f0 ' }, () => this.decrementClickCount());
        this.add.existing(this.decrementButton);

        this.updateClickCountText();



        this.input.keyboard.once('keyup_B', () => {
            this.startGame();
        });
    }

    /**
     * Starts a new game by create a game scene.
     */
    startGame() {
        console.log('new game')

        //this.scene.start('GameScene');
        //this.scene.start('HudScene');
        // start game
        this.scene.stop('MainScene');
        this.scene.add('GameScene', GameScene, true);
        this.scene.add('HudScene', HudScene, true);
    }

    incrementClickCount() {
        this.registry.set('playerCount', this.registry.get('playerCount') + 1);
        this.updateClickCountText();
    }

    decrementClickCount() {
        this.registry.set('playerCount', this.registry.get('playerCount') - 1);
        this.updateClickCountText();
    }

    updateClickCountText() {
        this.playerCountText.setText(`Button has been clicked ${this.registry.values.playerCount} times.`);
    }
}