
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
            // create a group for our graphics
            let statsPanel = this.add.group();
            // created on the world
            let graphics = this.add.graphics(); // adds to the world stage
            graphics.fillStyle(0xDDDDDD, 0.7);
            //graphics.lineStyle(2, 0xD0D, 1);
            graphics.fillRect(5, 5, 150, 50 * this.gameScene.players.length + 10);
            statsPanel.add(graphics);

            // create player stats
            this.gameScene.players.forEach((player, index) => {
                let badge = this.add.image(10, 10 + 50 * index, 'players', player.animationPrefix + '_badge2');
                // move badge origin
                badge.setOrigin(0);
                // display score next to badge
                let statText = this.add.text(15 + badge.width, 10 + 50 * index + badge.height / 2, 'Player' + (index + 1), { font: '32px Arial', fill: '#222'});
                statText.setOrigin(0);
                statText.y -= statText.height / 2;
                this.playerStats.push(statText);
            });
        }
        // update player scores
        this.gameScene.players.forEach((player, index) => {
            this.playerStats[index].text = '' + Math.round(player.score / 1000);
        });
    }
}