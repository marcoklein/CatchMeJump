import { GameScene } from "./GameScene";
import { HudScene } from "./HudScene";


export class MainScene extends Phaser.Scene {

    gameFinishedText: Phaser.GameObjects.Text;

    constructor() {
        super('MainScene');
    }

    create() {
        this.gameFinishedText = this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2, 'Get ready!', { font: '64px Arial', fill: '#DDD'});
        this.gameFinishedText.setOrigin(0.5);
        this.input.keyboard.on('keydown_B', () => {
            console.log('new game')
            // start game
            this.scene.stop('MainScene');
            this.scene.add('GameScene', GameScene, true);
            this.scene.add('HudScene', HudScene, true);

        });
    }

}