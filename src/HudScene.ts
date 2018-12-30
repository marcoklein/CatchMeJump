
import * as Phaser from 'phaser';
import { GameScene } from './GameScene';

export class HudScene extends Phaser.Scene {

    /**
     * Shows remaining time in seconds.
     */
    timeText: Phaser.GameObjects.Text;

    gameScene: GameScene;

    playerStats: Phaser.GameObjects.Text[] = [];

    constructor() {
        super({ key: 'HudScene', active: true });
    }

    preload() {
        // load players
        this.load.atlas('players', 'assets/sprites/aliens.png', 'assets/sprites/aliens.json');
    }

    create() {
        //this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#555'});
        //let info = this.add.text(10, 10, 'Score: 0', { font: '48px Arial', fill: '#000000' });
        
        
        this.timeText = this.add.text(this.game.canvas.width / 2, 10, '300s', { font: '32px Arial', fill: '#DDD' });
        
        // load game scene to display player information
        this.gameScene = <GameScene> this.game.scene.getScene('GameScene');


        // ensure game size is set properly
        this.game.resize(window.innerWidth, window.innerHeight);
        this.cameras.main.setSize(window.innerWidth, window.innerHeight);
        // add resize listener
        window.addEventListener('resize', () => {
            this.game.resize(window.innerWidth, window.innerHeight);
            this.cameras.main.setSize(window.innerWidth, window.innerHeight);
        });
    }

    update() {
        // position time text at top right
        this.timeText.x = this.game.canvas.width - this.timeText.width - 10;
        this.timeText.text = Math.round(this.gameScene.remainingGameTime / 1000) + 's';

        if (this.playerStats.length === 0) {
            // create player stats
            this.gameScene.players.forEach((player, index) => {
                this.add.image(10, 10 + 80 * index, 'players', 'alienBlue_badge1');
                let statText = this.add.text(10, 10 + 80 * index, 'Player' + (index + 1), { font: '32px Arial', fill: '#DDD'});
                this.playerStats.push(statText);
            });
        }
        // update player scores
        this.gameScene.players.forEach((player, index) => {
            this.playerStats[index].text = 'Player ' + (index + 1) + '\n' + Math.round(player.score / 1000);
        });
    }
}